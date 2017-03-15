const { getLoggedAccount } = require('../login-handler')
const { getNodeByPath } = require('../util')

exports.command = 'mkdir <target>'
exports.describe = 'Creates a folder in MEGA'
exports.builder = require('../options').loggedInOptions

exports.handler = (options) => {
  const { target } = options
  if (options.verbose > 0) {
    console.log('Creating directory %s', target)
  }

  const parsedTarget = target.split('/').filter(e => e)

  if (parsedTarget.shift().toLowerCase() !== 'root') {
    console.error("ERROR: creating folders outside /Root isn't supported")
    process.exit(1)
  }

  getLoggedAccount(options, (err, storage) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }

    const newFolderName = parsedTarget.pop()

    const folder = getNodeByPath(parsedTarget, storage.root)
    if (!folder) {
      console.error('ERROR: target folder not found')
      process.exit(1)
    }

    folder.mkdir(newFolderName, (err) => {
      if (err) return console.log(err)
      console.log('Folder created')
      storage.close()
    })
  })
}
