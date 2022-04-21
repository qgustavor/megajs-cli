const fs = require('fs-extra')
const path = require('path')
const shaper = require('shaper')
const { getNodeByPath, createFileProgressStream, parseFileSize } = require('../util')
const { getLoggedAccount } = require('../login-handler')

exports.command = 'upload <file>'
exports.describe = 'Uploads files to MEGA'
exports.aliases = 'put'
exports.builder = Object.assign({}, require('../options').loggedInOptions, {
  path: {
    describe: 'directory to upload to, defaults to root directory',
    type: 'string'
  },
  preview: {
    describe: 'upload custom preview image (JPEG 75%, maximum width and height = 1000px)',
    normalize: true,
    type: 'string'
  },
  thumbnail: {
    describe: 'upload custom thumbnail image (JPEG 70%, 120x120px)',
    normalize: true,
    type: 'string'
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
  const { file } = options
  // TODO: handle configuration file
  fs.stat(file, (err, stats) => {
    if (err && err.code === 'ENOENT') {
      console.error("ERROR: %s don't exists", file)
      process.exit(1)
    }

    if (err) {
      console.error(err)
      process.exit(1)
    }

    if (options.verbose > 0) {
      console.log('Uploading %s', file)
    }

    const target = options.path || '/Root'
    const parsedTarget = target.split('/').filter(e => e)

    if (parsedTarget.shift().toLowerCase() !== 'root') {
      console.error('ERROR: only uploading to /Root is supported')
      process.exit(1)
    }

    getLoggedAccount(options, (err, storage) => {
      if (err) return console.error(err.message)

      let customName = null
      // Try finding a folder
      let folder = getNodeByPath(parsedTarget, storage.root)

      // If not found consider the last part is the filename
      if (!folder) {
        customName = parsedTarget.pop()
        folder = getNodeByPath(parsedTarget, storage.root)
      }

      // If still don't found the target folder, return an error
      if (!folder) {
        console.error('ERROR: target folder not found')
        storage.close()
        process.exit(1)
      }

      const filename = customName || path.basename(file)

      // TODO: generate thumbnails automatically
      let uploadStream = folder.upload({
        name: filename,
        size: stats.size,
        previewImage: options.preview && fs.createReadStream(options.preview),
        thumbnailImage: options.thumbnail && fs.createReadStream(options.thumbnail),
        forceHttps: !options.allowUnsafeHttp
      })

      let readStream = fs.createReadStream(file)

      if (options.speedLimit) {
        uploadStream = uploadStream.pipe(shaper(parseFileSize(options.speedLimit)))
      }

      if (!options.noProgress) {
        const progressStream = createFileProgressStream(filename, stats.size)
        readStream = readStream.pipe(progressStream)
      }

      uploadStream.on('complete', () => {
        console.log('Upload complete')
        storage.close()
      })

      readStream.pipe(uploadStream)
    })
  })
}
