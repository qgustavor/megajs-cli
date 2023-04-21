#!/usr/bin/env node

process.title = 'MEGAJS'

// The require('yargs').argv getter have side effects
// so the ESHint error needs to be ignored.

const findConfig = require('find-config')
const fs = require('fs')

const configPath = findConfig('megajs-cli.json')
const config = configPath ? JSON.parse(fs.readFileSync(configPath)) : {}

require('yargs') // eslint-disable-line no-unused-expressions
  .commandDir('../lib/commands')
  .config(config)
  .recommendCommands()
  .demandCommand(1, 'You need at least one command before moving on')
  .help()
  .argv
