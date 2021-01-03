const { readdirSync, mkdirSync, existsSync, statSync, writeFileSync, copyFileSync, readFileSync } = require('fs');
const { resolve, join, normalize, dirname, relative, basename, extname } = require('path');
const inquirer = require('inquirer');
const glob = require("glob");
const generatePackageJson = require('../helpers/package/generate');
const installPackageJson = require('../helpers/package/installs');
const chalk = require('chalk');


const executingPath = process.cwd();
const templatesPath = normalize(join(__dirname, '../../templates'));
const templatesFolders = glob.sync(join(templatesPath, "*.json"))
.map(filePath => ({
  name: basename(filePath, extname(filePath)),
  config: JSON.parse(readFileSync(filePath).toString())
}));

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

    const templatePath = join(templatesPath, templateName);
    outputPath = resolve(executingPath, projectName);
    template = templatesFolders.find(({ name }) => name == templateName);

    const ioItems = glob.sync(join(templatePath, '**/*'));

    console.log(chalk.greenBright(`\nCopying template's source:
  from  '${templatePath}'
  to    '${outputPath}'
  ` ));
    
    // copy source
    ioItems
    .forEach(srcItem => {
      const srcStats = statSync(srcItem);

      const srcFolder = srcStats.isDirectory() ? srcItem : dirname(srcItem);
      const relFolder = relative(templatePath, srcFolder);

      const outFolder = join(outputPath, relFolder);
      const outFile = srcStats.isFile() ? join(outFolder, basename(srcItem)) : null;

      console.log(' - ', relative(templatePath, srcItem));
      if (verbose) {
        console.log(chalk.cyan('   - from        ', srcItem));
        outFile || console.log(chalk.cyan('   - out [folder]', outFolder));
        outFile && console.log(chalk.cyan('   - out [file]  ', outFile));
      }

      if (!existsSync(outFolder)) {
        mkdirSync(outFolder, {
          recursive: true
        });
      }

      if (outFile) {
        const outFile = join(outFolder, basename(srcItem));

        copyFileSync(srcItem, outFile);
      }
    });
  })
  .then(() => console.log(chalk.green("\ttemplate's source copied!")))
  .then(() => console.log(chalk.greenBright("\nGenerate package.json file")))
  .then(() => generatePackageJson({
    verbose,
    debug,
    version,
    template,
    projectName
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
  .then(() => console.log(`${chalk.greenBright("\nInstalling package.json dependencies")} ${chalk.cyan(`(changing current directory to '${outputPath}')`)}`))
  .then(() => installPackageJson({
    verbose,
    debug,
    template,
    outputPath
  }))
  .then(() => console.log(chalk.green("\tpackages installed!")))
  .then(function() {
    console.log(chalk.bgGreen.white("\n\nSUCCESS!"));
  });
};