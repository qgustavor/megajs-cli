#!/usr/bin/env node

process.title = 'MEGAJS'

// The require('yargs').argv getter have side effects
// so the ESHint error needs to be ignored.

require('yargs') // eslint-disable-line no-unused-expressions
  .commandDir('../lib/commands')
  .recommendCommands()
  .demandCommand(1, 'You need at least one command before moving on')
  .help()
  .argv
