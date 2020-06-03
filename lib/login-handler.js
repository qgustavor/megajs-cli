const mega = require('megajs')
const inquirer = require('inquirer')
const { applyConnectionSettings } = require('./util')

const ACCOUNT_CACHE = {}

function getLoggedAccount (options, cb) {
  if (!options.username) {
    // TODO: prompt for username?
    cb(Error('ERROR: username (email) is not defined'))
    return
  }

  const cached = ACCOUNT_CACHE[options.username]
  if (cached) {
    process.nextTick(() => {
      cb(cached)
    })
    return
  }

  if (!options.password) {
    if (options.askPassword === false) {
      cb(Error('ERROR: password is not defined'))
      return
    }

    inquirer.prompt([{
      message: 'Password:',
      type: 'password',
      name: 'password'
    }])
      .then((results) => {
        options.password = results.password
        getLoggedAccount(options, cb)
      })
      .catch((error) => cb(error))
    return
  }

  const storage = new mega.Storage({
    email: options.username,
    password: options.password,
    autologin: false
  })

  ACCOUNT_CACHE[options.username] = storage
  applyConnectionSettings(storage.api, options)

  storage.login((err) => {
    if (err) {
      cb(err)
    } else {
      cb(err, storage)
    }
  })
}

exports.getLoggedAccount = getLoggedAccount
