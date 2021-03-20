const { readdirSync, mkdirSync, existsSync, statSync, writeFileSync, copyFileSync, readFileSync } = require('fs');
const { resolve, join, normalize, dirname, relative, basename, extname } = require('path');
const inquirer = require('inquirer');
const glob = require("glob");
const chalk = require('chalk');

let templates;

module.exports = {
  lokup(templatePath) {
    templates = glob.sync(join(templatesPath, "*.json"))
    .reduce((accum, filePath) => {
      const name = basename(filePath, extname(filePath));
      const config = JSON.parse(readFileSync(filePath).toString());

      // todo: merge with dependencies

      return {
        ...accum,
        [name]: {
          name,
          config
        }
      }
    }, {});

    return Object.entries(templates)
    .map(([name, data]) => data);
  }
}