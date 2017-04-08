const mega = require('megajs')
const fs = require('fs-extra')
const path = require('path')
const sanitizeFilename = require('sanitize-filename')
const { applyProxySettings, downloadFolder, downloadFileTo } = require('../util')

exports.command = 'download <remote path>'
exports.aliases = 'dl'
exports.describe = 'Downloads shared files and folders'
exports.builder = Object.assign({}, require('../options').globalOptions, {
  path: {
    describe: 'directory to download to, defaults to current working directory, use - for stdout',
    type: 'string',
    requiresArg: true
  },
  connections: {
    describe: 'parallel connections count',
    default: 4,
    type: 'number',
    requiresArg: true
  },
  progress: {
    describe: 'report progress (disable with --no-progress)',
    default: true,
    type: 'boolean'
  }
})

exports.handler = (options) => {
  const { remotepath } = options
  // TODO: handle configuration file
  const target = options.path || process.cwd()

  if (options.verbose > 0) {
    console.log('Downloading %s to %s', remotepath, target)
  }

  let file
  try {
    // fromURL throws if the URL is not valid
    file = mega.File.fromURL(remotepath)
  } catch (error) {
    console.error(error.message)
    process.exit(1)
  }

  if (!file.key) {
    console.error("ERROR: downloading without an encryption key isn't supported")
    process.exit(1)
  }

  applyProxySettings(file.api, options.proxy)

  file.loadAttributes((error, result) => {
    if (error) {
      console.error(error.message)
      process.exit(1)
    }

    if (options.verbose > 0) {
      console.log('Filename: %s', result.name)
    }

    file = result
    checkTarget()
  })

  function checkTarget () {
    // handle stdout
    if (target === '-') {
      downloadFileTo(file, target, options)
    }

    // check target stats
    fs.stat(target, (err, stats) => {
      if (err) {
        if (err.code !== 'ENOENT') throw err
        // File not exists, check if the directory exists
        checkDirectory()
        return
      }

      if (stats.isDirectory()) {
        // target is a folder
        if (file.directory) {
          downloadFolder(file, target, options)
        } else {
          downloadFileTo(file, path.join(target, sanitizeFilename(file.name)), options)
        }
        return
      }

      console.error('ERROR: file exists')
      process.exit(1)
    })
  }

  function checkDirectory () {
    // check if target is a directory
    const dir = path.dirname(target)
    fs.stat(dir, (err, stats) => {
      if (err) {
        if (err.code !== 'ENOENT') throw err
        // directory don't exists
        console.error("ERROR: target path don't exists")
        process.exit(1)
      }

      if (stats.isDirectory()) {
        // target is a file, allow overwriting downloaded file name
        if (file.directory) {
          console.error('ERROR: cannot download a folder to a file')
          process.exit(1)
        }

        downloadFileTo(file, target, options)
        return
      }

      // something like file.txt/otherfile.txt
      console.error('ERROR: invalid path')
      process.exit(1)
    })
  }
}
