const { readdirSync, mkdirSync, existsSync, statSync, writeFileSync, copyFileSync, readFileSync } = require('fs');
const { resolve, join, normalize, dirname, relative, basename, extname } = require('path');

const inquirer = require('inquirer');
const glob = require("glob");
const chalk = require('chalk');

const { lookup, expand } = require('../helpers/templates/factory');
const generatePackageJson = require('../helpers/package/generate');
const installPackageJson = require('../helpers/package/installs');
const copySourceFiles = require('../helpers/source/copy');


const executingPath = process.cwd();
const templatesPath = normalize(join(__dirname, '../../templates'));
const templatesFolders = lookup(templatesPath);

const validateProjectName = function(input) {
  return !!(/^([A-Za-z\-\_\d])+$/.test(input))  || 'Project name may only include letters, numbers, underscores and hashes.';
}

const generationQuestions = [
  {
    name: 'template-name',
    type: 'list',
    message: 'What project template would you like to generate?',
    choices: templatesFolders
    .map(({ name, config: { info } }) => ({
      name: `${chalk.bold(name)} - ${info}`,
      value: name,
      short: name
    }))
  },
  {
    name: 'project-name',
    type: 'input',
    message: 'Project name:',
    validate: validateProjectName
  }
];

module.exports = (argv, { version }) => {
  console.log("Starting generate template task!\t");

  let {
    verbose,
    debug,
    'template-name': templateName,
    'project-name': projectName
  } = argv;

  if (templateName) {
    if (!templatesFolders.some(({ name }) => name == templateName)) {
      throw "Project type not existing!";
    }

    generationQuestions.shift();
  }

  if (projectName) {
    let validateProjectNameResult;
    if ((validateProjectNameResult = validateProjectName(projectName)) != true) {
      throw validateProjectNameResult;
    }

    generationQuestions.shift();
  }

  let outputPath;
  let template;

  return inquirer
  .prompt(generationQuestions)
  .then(answers => {
    templateName = templateName || answers['template-name'];
    projectName = projectName || answers['project-name'];

    outputPath = resolve(executingPath, projectName);
    template = expand(templateName, templatesFolders);
  })
  .then(() => console.log(chalk.greenBright("\nCopying source files")))
  .then(() => copySourceFiles({
    verbose,
    debug,
    version,
    template,
    projectName,
    outputPath
  }))
  .then(() => console.log(chalk.green("\ttemplate's source copied!")))
  .then(() => console.log(chalk.greenBright("\nGenerate package.json file")))
  .then(() => generatePackageJson({
    verbose,
    debug,
    version,
    template,
    projectName,
    outputPath
  }))
  .then((pj) => {
    console.log(chalk.greenBright("\nWriting package.json file"))
    verbose && console.log(pj)

    writeFileSync(
      join(outputPath, 'package.json'),
      JSON.stringify(pj, null, 2)
    );
  })
  .then(() => console.log(chalk.green("\tpackage.json file persisted!")))
  .then(() => console.log(chalk.greenBright("\nInstalling package.json dependencies")))
  .then(() => installPackageJson({
    verbose,
    debug,
    version,
    template,
    projectName,
    outputPath
  }))
  .then((packagesInstalled) => packagesInstalled ?
    console.log(chalk.green("\tpackages installed!")) :
    console.log(chalk.green("\tinstall packages later!"))
  )
  .then(function() {
    const { notes } = template;
    if (notes) {
      console.log(chalk.cyan("\nNotes from template:"));
      console.log(chalk.cyanBright(notes));
    }

    console.log(chalk.bgGreen.white("\n\nSUCCESS!"));
  });
};