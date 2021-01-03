#!/usr/bin/env node
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const chalk = require('chalk');

var pjson = require('../package.json');

const generate = require("./tasks/generate");


const executeTask = async (task, argv) => {
  try {
    await Promise.resolve(task(argv, pjson));
  } catch (exc) {
    console.log(chalk.black.bgRed.bold('- ERROR!'));
    console.error(exc);
    console.log(chalk.black.bgRed("Shutting down early!"));
  }
};

yargs(hideBin(process.argv))
.command('generate [template-name] [project-name]', 'start template generation', (yargs) => {
  yargs
  .positional('template-name', {
    describe: 'project\'s type name',
    //default: 5000
  })
  .positional('project-name', {
    describe: 'project\'s name'
  })
}, (argv) => {
  if (argv.verbose) {
    console.info(chalk.cyan(`starting generation with args: "${argv['template-name']}" "${argv['project-name']}"`))
  }

  executeTask(generate, argv);
})
.option('verbose', {
  alias: 'v',
  type: 'boolean',
  description: 'Run with verbose logging'
})
.option('debug', {
  alias: 'd',
  type: 'boolean',
  description: 'Run in debug mode'
})
.argv;