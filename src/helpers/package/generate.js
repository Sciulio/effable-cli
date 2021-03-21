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
    version: templateVersion,
    package
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
  "keywords": (await askUser("keywords", '')).split(" ").filter(Boolean),
  ...package,
  "effable": {
    "cli-version": version,
    "template-name": templateName,
    "template-version": templateVersion
  }
});