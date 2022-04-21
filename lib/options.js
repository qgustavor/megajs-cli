exports.globalOptions = {
  'speed-limit': {
    describe: 'limit download/upload speed, if no unit is specified it defaults to KiB/s',
    type: 'string',
    requiresArg: true
  },
  verbose: {
    describe: 'show extra information',
    type: 'count'
  },
  'allow-unsafe-http': {
    describe: 'Allow downloading/uploading using unsafe HTTP',
    type: 'boolean'
  }
}

const loggedInOptions = {
  username: {
    alias: 'u',
    demandOption: true,
    describe: 'account email',
    type: 'string',
    requiresArg: true
  },
  password: {
    alias: 'p',
    describe: 'account password',
    type: 'string',
    requiresArg: true
  },
  askPassword: {
    default: true,
    describe: 'prompt interactively a password',
    type: 'boolean'
  }
}

exports.loggedInOptions = Object.assign({}, exports.globalOptions, loggedInOptions)

exports.optionalLoggedInOptions = Object.keys(loggedInOptions).reduce((newObj, key) => {
  newObj[key] = Object.assign({}, loggedInOptions[key])
  delete newObj[key].demandOption

  return newObj
}, Object.assign({}, exports.globalOptions))
