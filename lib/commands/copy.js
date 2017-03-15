exports.command = 'copy [local] [remote]'
exports.describe = 'Copies an local directory to a remote one, or vice-versa.'
exports.builder = Object.assign({}, require('../options').loggedInOptions, {
  local: {
    describe: 'local path',
    alias: 'l',
    type: 'string',
    requiresArg: true
  },
  remote: {
    describe: 'remote path',
    alias: 'r',
    type: 'string',
    requiresArg: true
  },
  dryrun: {
    describe: "don't download or upload files, instead just print what will be done",
    alias: 'n',
    type: 'boolean'
  },
  progress: {
    describe: 'report progress (disable with --no-progress)',
    default: true,
    type: 'boolean'
  },
  disablePreviews: {
    describe: 'disable automatic thumbnails and preview images generation',
    type: 'boolean'
  }
})

exports.handler = (options) => {
  console.error('ERROR: not implemented')
  process.exit(1)
}
