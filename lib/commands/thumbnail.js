const { getLoggedAccount } = require('../login-handler')
const { getNodeByPath } = require('../util')
const fs = require('fs')

exports.command = 'thumbnail <remote path> <image path>'
exports.describe = 'Uploads a thumbnail to a file stored in MEGA'
exports.builder = require('../options').loggedInOptions

exports.handler = (options) => {
  const { remotepath, imagepath } = options
  if (options.verbose > 0) {
    console.log('Uploading thumbnail to %s', remotepath)
  }

  const parsedTarget = remotepath.split('/').filter(e => e)

  if (parsedTarget.shift().toLowerCase() !== 'root') {
    console.error("ERROR: changing files outside /Root isn't supported")
    process.exit(1)
  }

  getLoggedAccount(options, (err, storage) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }

    const node = getNodeByPath(parsedTarget, storage.root)
    if (!node) {
      console.error('ERROR: target file not found')
      process.exit(1)
    }

    if (node.folder) {
      console.error('ERROR: you cannot upload a thumbnail to a folder')
      process.exit(1)
    }

    fs.readFile(imagepath, (err, imageData) => {
      if (err) {
        console.log(err)
        process.exit(1)
      }
      node.uploadAttribute('thumbnail', imageData, (err) => {
        if (err) {
          console.log(err)
          process.exit(1)
        }
        console.log('Thumbnail uploaded')
        storage.close()
      })
    })
  })
}
