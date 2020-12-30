const npm = require('npm')
const { readdirSync, mkdirSync, existsSync, statSync, writeFileSync, copyFileSync } = require('fs');
const { resolve, join, normalize, dirname, relative, basename, extname } = require('path');
const inquirer = require('inquirer');
const glob = require("glob")

const executingPath = process.cwd();
const templatesPath = normalize(join(__dirname, '../../templates'));
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

module.exports = (argv, { version }) => {
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
    let validateProjectNameResult;
    if ((validateProjectNameResult = validateProjectName(projectName)) != true) {
      console.error(validateProjectNameResult);
      console.error("Shutting down!");
      return;
    }

    generationQuestions.shift(projectChoice);
  }

  let outputPath;

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
    outputPath = resolve(executingPath, projectName);

    const ioItems = glob.sync(join(templatePath, '**/*'));

    console.log(" - templatePath:", templatePath)
    console.log(" - outputPath:", outputPath)
    verbose && (console.log(" - ioItems") || console.log(ioItems))

    // copy source
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
  })
  .then(async () => ({
    "name": projectName,
    "description": await askUser("description"),
    "version": "0.0.1",
    "homepage": "",
    "author": `${await askUser("author-name")} ${await askUser("author-url")}`,
    "repository": "", // "<%= ask('owner') %>/<%= ask('name') %>",
    "bugs": {
      //"url": "https://github.com/<%= ask('owner') %>/<%= ask('name') %>/issues"
    },
    "engines": {
      "node": ">=4"
    },
    "license": await askUser("license", 'MIT'),
    "scripts": {
      //"test": "mocha",
      "debug-build": "env-cmd -f .secrets  cross-env NODE_ENV=development  node -r dotenv/config ./build.js",
      "debug-watch": "npm-watch debug-build",
      //"debug-netlify": "netlify dev",
      //"debug": "concurrently --kill-others \"npm run debug-watch\" \"npm run debug-netlify\"",
      "build": "cross-env NODE_ENV=production  node -r dotenv/config ./build.js",
      "start": "npm run debug"
    },
    "watch": {
      "debug-build": "./src/**/*.*"
    },
    "keywords": [],
    "dependencies": {
      "cross-env": "^7.0.3",
      "dotenv": "^8.2.0",
      "@sciulio/effable": "^1.7.2",
      // todo: get other packages from template
      //"handlebars-helpers": "^0.10.0",
    },
    /*"devDependencies": {
      "concurrently": "^5.3.0",
      "npm-watch": "^0.7.0"
    },*/
    "effable": {
      "cli-version": version,
      "template-name": projectChoice,
      "template-version": ""
    }
  }))
  .then((pj) => {
    console.log('Writing package.json')
    console.log(pj)
    writeFileSync(join(outputPath, 'package.json'), JSON.stringify(pj, null, 2))
  })
  .then((pj) => new Promise((res, rej) => {
    process.chdir(outputPath);

    npm.load(function(err) {
      if (err) {
        return rej(err);
      }
      
      npm.commands.install([], function(err, data) {
        if (err) {
          return rej(err);
        }
        console.log('Packages installed');
      });
    
      npm.on('log', function(message) {
        console.log("message-");
        console.log(message);
      });
    });
  }))
  .then(function() {
    console.log("SUCCESS!");
  })
  .catch(err => {
    console.error("Error!")
    console.error(err);
  });
};

const askUser = async (name, _default) => inquirer.prompt({
  name,
  type: 'input',
  message: name + ':',
  //validate: validateProjectName
})
.then(({[name]: input}) => input || _default || '')
.then(input => input.replace(/"/g, '\"'));