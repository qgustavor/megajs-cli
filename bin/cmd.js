#!/usr/bin/env node

const pkg = require('../package.json')
const updateNotifier = require('update-notifier')({ pkg })
updateNotifier.notify({ defer: true })

const program = require('commander')
program.version(pkg.version)

program.Command.prototype.addGlobalOptions = function () {
  this
  .option('--proxy <url>', 'proxy server to use')
  .option('--speed-limit <speed>', 'limit download/upload speed, if no unit is specified it defaults to KiB/s')
  .option('--config <path>', 'load configuration from a file')
  .option('--ignore-config-file', "ignore user's .megajsrc")
  .option('-v --verbose', 'show extra information', (v, total) => total + 1, 0)

  return this
}

program.Command.prototype.addLoggedOptions = function () {
  this
  .option('-u --username <email>', 'account email')
  .option('-p --password <password>', 'account password')
  .option('--no-ask-password', "don't prompt interactively for a password")

  return this.addGlobalOptions()
}

require('../lib/commands/download')(program)
require('../lib/commands/upload')(program)
require('../lib/commands/list')(program)
require('../lib/commands/mkdir')(program)
require('../lib/commands/copy')(program)

// default command
program.action((cmd) => {
  console.log('> MEGAJS')
  console.log('> %s is not a valid command', cmd)
  program.help()
  process.exit()1p
})

// init process
process.title = 'MEGAJS'
program.parse(process.argv)
if (process.argv.length < 3) {
  console.log('> MEGAJS')
  program.help()
}
