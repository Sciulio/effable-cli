#!/usr/bin/env node
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

var pjson = require('../package.json');

const generate = require("./tasks/generate");


yargs(hideBin(process.argv))
.command('generate [project-choice] [project-name]', 'start template generation', (yargs) => {
  yargs
  .positional('project-choice', {
    describe: 'project\'s type name',
    //default: 5000
  })
  .positional('project-name', {
    describe: 'project\'s name'
  })
}, (argv) => {
  if (argv.verbose) {
    console.info(`starting generation with args: "${argv['project-choice']}" "${argv['project-name']}"`)
  }
  generate(argv, pjson);
})
.option('verbose', {
  alias: 'v',
  type: 'boolean',
  description: 'Run with verbose logging'
})
.argv;