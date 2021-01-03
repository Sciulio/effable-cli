const inquirer = require('inquirer');


const askUser = async (name, _default) => inquirer.prompt({
  name,
  type: 'input',
  message: name + ':',
  //validate: validateProjectName
  default: _default
})
.then(({ [name]: input }) => input || _default || '')
.then(input => input.replace(/"/g, '\"'));


module.exports = async ({
  verbose,
  debug,
  version,
  template: {
    name: templateName,
    config: {
      version: templateVersion,
      package: {
        scripts: additionalScripts,
        dependencies: additionalDependencies,
        devDependencies: additionalDevDependencies
      }
    },
  },
  projectName
}) => ({
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
  "scripts": Object.assign({
    //"test": "mocha",
    "debug-build": "cross-env NODE_ENV=development  node -r dotenv/config ./build.js",
    "debug-watch": "npm-watch debug-build",
    //"debug-netlify": "netlify dev",
    //"debug": "concurrently --kill-others \"npm run debug-watch\" \"npm run debug-netlify\"",
    "build": "cross-env NODE_ENV=production  node -r dotenv/config ./build.js",
    "start": "npm run debug"
  }, additionalScripts),
  "watch": {
    "debug-build": "./src/**/*.*"
  },
  "keywords": [],
  "dependencies": Object.assign({
    "cross-env": "^7.0.3",
    "dotenv": "^8.2.0",
    "@sciulio/effable": "^1.7.2",
    // todo: get other packages from template
    //"handlebars-helpers": "^0.10.0",
  }, additionalDependencies),
  "devDependencies": Object.assign({}, additionalDevDependencies),
  /*"devDependencies": {
    "concurrently": "^5.3.0",
    "npm-watch": "^0.7.0"
  },*/
  "effable": {
    "cli-version": version,
    "template-name": templateName,
    "template-version": templateVersion
  }
});