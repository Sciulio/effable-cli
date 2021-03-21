const { readdirSync, mkdirSync, existsSync, statSync, writeFileSync, copyFileSync, readFileSync } = require('fs');
const { resolve, join, normalize, dirname, relative, basename, extname } = require('path');
const chalk = require('chalk');
const glob = require("glob");


const props = (prop, template, list) => {
  const { name } = template;

  if (list.indexOf(name) >= 0) {
    return [];
  }
  list.push(name);

  const { [prop]: value } = template;

  return [
    ...Object.entries(template.dependencies)
    .map(([tName, tValue]) => props(prop, tValue, list)),
    value
  ];
}

module.exports = (prop, template) => {
  return props(prop, template, []);
}