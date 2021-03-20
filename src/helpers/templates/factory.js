const { readdirSync, mkdirSync, existsSync, statSync, writeFileSync, copyFileSync, readFileSync } = require('fs');
const { resolve, join, normalize, dirname, relative, basename, extname } = require('path');
const inquirer = require('inquirer');
const glob = require("glob");
const chalk = require('chalk');

let templates;

const arrayfy = item => item ? Array.isArray(item) ? item : [item] : [];

module.exports = {
  lookup(templatesPath) {
    templates = glob.sync(join(templatesPath, "*.json"))
    .reduce((accum, filePath) => {
      const name = basename(filePath, extname(filePath));
      const path = join(templatesPath, name);
      let config = JSON.parse(readFileSync(filePath).toString());

      // todo: merge with dependencies
      config = {
        ...config,
        info: arrayfy(config.info),
        alert: arrayfy(config.alert),
        notes: arrayfy(config.notes),
      };

      return {
        ...accum,
        [name]: {
          name,
          path,
          config
        }
      };
    }, {});

    Object.entries(templates)
    .filter(([_, { config: { dependencies = {} } }]) => Object.keys(dependencies).length)
    .forEach(([prop, template]) => {
      template.dependencies = Object.keys(template.config.dependencies)
      .map(templateName => templates[templateName]);
    });

    //todo: check for circular dependencies

    return Object.entries(templates)
    .map(([name, data]) => data);
  }
}