#!/usr/bin/env node

const pkg = require('../package.json')
const updateNotifier = require('update-notifier')({ pkg })

if (updateNotifier.update) {
  updateNotifier.notify({
    defer: true,
    message: process.pkg && `Update available: ${updateNotifier.update.current} → ${updateNotifier.update.latest}
Download it here:
https://github.com/qgustavor/megajs-cli/releases/latest`
  })
}

process.title = 'MEGAJS'

require('yargs')
  .commandDir('../lib/commands')
  .recommendCommands()
  .demandCommand(1, 'You need at least one command before moving on')
  .help()
  .epilogue('for more information check ' + pkg.homepage)
  .argv
