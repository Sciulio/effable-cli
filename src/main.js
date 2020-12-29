const { readdirSync, mkdirSync, existsSync, statSync, copyFile, copyFileSync } = require('fs');
const { resolve, join, normalize, dirname, relative, basename, extname } = require('path');
const inquirer = require('inquirer');
const glob = require("glob")

const executingPath = process.cwd();
const templatesPath = normalize(join(__dirname, '../templates'));
const templatesFolders = readdirSync(templatesPath);

const QUESTIONS = [
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
    validate(input) {
      if (/^([A-Za-z\-\_\d])+$/.test(input)) return true;
      else return 'Project name may only include letters, numbers, underscores and hashes.';
    }
  }
];


inquirer
.prompt(QUESTIONS)
.then(answers => {
  console.log(answers);

  const {
    'project-choice': projectChoice,
    'project-name': projectName
  } = answers;
  const templatePath = join(templatesPath, projectChoice);
  const outputPath = resolve(executingPath, projectName);

  console.log("templatePath")
  console.log(templatePath)
  console.log(outputPath)

  const ioItems = glob.sync(join(templatePath, '**/*'));
  console.log("ioItems")
  console.log(ioItems)

  ioItems
  .forEach(srcItem => {
    const srcStats = statSync(srcItem);
    
    const srcFolder = srcStats.isDirectory() ? srcItem : dirname(srcItem);
    const outFolder = join(outputPath, relative(templatePath, srcFolder));
    const outFile = srcStats.isFile() ? join(outFolder, basename(srcItem)) : null;

    console.log('srcItem', srcItem)
    outFile || console.log(' - outFolder', outFolder)
    outFile && console.log(' - outFile', outFile);

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

  createDirectoryContents(templatePath, projectName);
});