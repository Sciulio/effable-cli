const { readdirSync, mkdirSync, existsSync, statSync, copyFile, copyFileSync } = require('fs');
const { resolve, join, normalize, dirname, relative, basename, extname } = require('path');
const inquirer = require('inquirer');
const glob = require("glob")

const executingPath = process.cwd();
const templatesPath = normalize(join(__dirname, '../templates'));
const templatesFolders = readdirSync(templatesPath);

const validateProjectName = function(input) {
  return !!(/^([A-Za-z\-\_\d])+$/.test(input))  || 'Project name may only include letters, numbers, underscores and hashes.';
}

const generationQuestions = [
  {
    name: 'project-choice',
    type: 'list',
    message: 'What project template would you like to generate?',
    choices: templatesFolders
  },
  {
    name: 'project-name',
    type: 'input',
    message: 'Project name:',
    validate: validateProjectName
  }
];

module.exports = (argv) => {
  console.log("Generate task!");

  let {
    verbose,
    'project-choice': projectChoice,
    'project-name': projectName
  } = argv;

  if (projectChoice) {
    if (!templatesFolders.includes(projectChoice)) {
      console.error("Project type not existing!");
      console.error("Shutting down!");
      return;
    }

    generationQuestions.shift(projectChoice);
  }

  if (projectName) {
    let vRes;
    if ((vRes = validateProjectName(projectName)) != true) {
      console.error(vRes);
      console.error("Shutting down!");
      return;
    }

    generationQuestions.shift(projectChoice);
  }

  inquirer
  .prompt(generationQuestions)
  .then(answers => {
    console.log(answers);

    const {
      'project-choice': _projectChoice,
      'project-name': _projectName
    } = answers;

    projectChoice = projectChoice || _projectChoice;
    projectName = projectName || _projectName;

    const templatePath = join(templatesPath, projectChoice);
    const outputPath = resolve(executingPath, projectName);

    const ioItems = glob.sync(join(templatePath, '**/*'));

    console.log(" - templatePath:", templatePath)
    console.log(" - outputPath:", outputPath)
    console.log(" - ioItems")
    console.log(ioItems)

    ioItems
    .forEach(srcItem => {
      const srcStats = statSync(srcItem);

      const srcFolder = srcStats.isDirectory() ? srcItem : dirname(srcItem);
      const outFolder = join(outputPath, relative(templatePath, srcFolder));
      const outFile = srcStats.isFile() ? join(outFolder, basename(srcItem)) : null;

      console.log(' - srcItem', srcItem)
      outFile || console.log(' - - outFolder', outFolder)
      outFile && console.log(' - - outFile', outFile);

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
  });
};