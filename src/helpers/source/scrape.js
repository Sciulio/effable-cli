const { readdirSync, mkdirSync, existsSync, statSync, writeFileSync, copyFileSync, readFileSync } = require('fs');
const { resolve, join, normalize, dirname, relative, basename, extname } = require('path');
const chalk = require('chalk');
const glob = require("glob");


module.exports = ({ name, path, dependencies }) => {
  return [
    path,
    ...dependencies
    .map(({ path }) => path)
  ]
  .reduce((accum, path) => ([
    ...accum,
    ...glob.sync(join(path, '**/*'), {
      dot: true
    })
  ]), []);
}