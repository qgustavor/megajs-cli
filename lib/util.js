const sanitizeFilename = require('sanitize-filename')
const progressStream = require('progress-stream')
const shaper = require('shaper')
const fs = require('fs-extra')
const path = require('path')
const minimatch = require('minimatch')
const packageInfo = require('../package.json')
const url = require('url')

function applyConnectionSettings (api) {
  api.userAgent = `megajs-cli/${packageInfo.version} ${api.userAgent}`
}

function defaultDownloadCallback (error) {
  if (error) {
    console.error(error)
    console.error('You can continue the download later using the --continue option')
    process.exit(1)
  }
}

function downloadFolder (folder, target, options, cb = defaultDownloadCallback) {
  const queue = createFileList(folder, '', options)
  downloadFolderLoop(target, options, queue, cb)
}

function createFileList (topFile, basename, options) {
  if (!options) options = {}
  const recursive = typeof options.recursive === 'undefined' ? true : options.recursive

  const globOptions = {
    nocase: options.ignoreCase
  }
  const regexOptions = options.ignoreCase ? 'i' : ''
  const acceptFn = options.accept && minimatch.filter(options.accept, globOptions)
  const rejectFn = options.reject && minimatch.filter(options.reject, globOptions)
  const acceptRegex = options.acceptRegex && new RegExp(options.acceptRegex, regexOptions)
  const rejectRegex = options.rejectRegex && new RegExp(options.rejectRegex, regexOptions)

  return (options.andSelf ? [topFile] : []).concat(topFile.children).map(file => {
    if (!file) return []
    const filename = file.name
      ? sanitizeFilename(file.name)
      : '[encrypted filename]'
    const filePath = file === topFile
      ? basename
      : basename
        ? path.posix.join(basename, filename)
        : filename

    const isDirectory = file.directory
    return isDirectory && file !== topFile && recursive
      ? createFileList(file, filePath, options)
      : { file, filePath }
  })
    .reduce((all, sub) => all.concat(sub), [])
    .sort((fileA, fileB) => fileA.filePath.localeCompare(fileB.filePath))
    .filter(file => {
      const filePath = file.filePath
      if (acceptFn && !acceptFn(filePath)) return false
      if (rejectFn && rejectFn(filePath)) return false
      if (acceptRegex && !acceptRegex.test(filePath)) return false
      if (rejectRegex && rejectRegex.test(filePath)) return false
      return true
    })
}

function downloadFileTo (file, target, options = {}, callback = defaultDownloadCallback) {
  let startByte
  if (target === '-') {
    // start download
    ensureCallback()
  } else {
    // check if new file exists
    fs.stat(target, statCallback)
  }

  function statCallback (err, stats) {
    if (err && err.code !== 'ENOENT') throw err
    if (!err) {
      if (options.continue && stats.size < file.size) {
        startByte = stats.size
      } else {
        callback(Error('File exists'))
        return
      }
    }

    fs.ensureDir(path.dirname(target), ensureCallback)
  }

  function ensureCallback (err) {
    if (err) throw err

    let downloadStream = file
      .download({
        start: startByte,
        maxConnections: options.connections,
        forceHttps: !options.allowUnsafeHttp
      })
      .on('error', callback)

    if (options.speedLimit) {
      downloadStream = downloadStream.pipe(shaper(parseFileSize(options.speedLimit)))
    }

    if (options.progress && target !== '-') {
      const progressStream = createFileProgressStream(file.name, file.size, startByte)
      downloadStream = downloadStream.pipe(progressStream)
    }

    const writeStream = target === '-'
      ? process.stdout
      : fs.createWriteStream(target, {
        flags: startByte ? 'r+' : 'w',
        start: startByte
      })

    downloadStream
      .on('end', () => { callback(null) })
      .pipe(writeStream)
  }
}

function downloadFolderLoop (target, options, queue, cb) {
  const item = queue.shift()
  if (!item) {
    cb()
    return
  }

  console.log('F %s', item.file.name)
  downloadFileTo(item.file, path.join(target, item.filePath), options, (err) => {
    if (err && err.message === 'File exists') {
      if (!options.disableExistsMessage) {
        console.error('ERROR: %s exists', item.filePath)
      }
      downloadFolderLoop(target, options, queue, cb)
      return
    }
    if (err) cb(err)

    downloadFolderLoop(target, options, queue, cb)
  })
}

function createFileProgressStream (filename, length, start = 0) {
  const stream = progressStream({
    length,
    transferred: start,
    time: 1000
  })

  // 32 characters seems a reasonable size for the stats
  const maxNameWidth = Math.max(0, process.stdout.columns - 32)
  const formattedTotal = fileSize(length)

  console.log('%s: 0% - 0 bytes of %s', filename, formattedTotal)
  stream.on('progress', (progress) => {
    // return the previous line (A), then to the first character (G), clean the line (2K) and print progress
    console.log('\x1b[A\x1b[G\x1b[2K%s: %s - %s of %s',
      filename.substr(0, maxNameWidth),
      Math.round(progress.percentage) + '%',
      fileSize(progress.transferred),
      formattedTotal
    )
  })

  stream.on('finish', () => {
    // Just move to next line:
    console.log('')
  })

  return stream
}

function fileSize (bytes) {
  const exp = Math.floor(Math.log(bytes) / Math.log(1024))
  const result = (bytes / Math.pow(1024, exp)).toFixed(2)

  return result + ' ' + (exp === 0 ? 'bytes' : 'KMGTPEZY'.charAt(exp - 1) + 'B')
}

function parseFileSize (input) {
  // consider bytes, not bits
  input = input.trim().toLowerCase()
  const value = parseFloat(input)
  let unit = input.replace(/^[\d.]+/, '')

  if (!unit) unit = 'k'
  if (unit === 'bytes') return Math.floor(value)

  const units = 'kmgtpezy'
  return Math.floor(value * Math.pow(1024, 1 + units.indexOf(value.charAt(0))))
}

function getNodeByPath (path, folder) {
  path.forEach((folderName) => {
    if (!folder) return

    // Try matching by node id (filename.nodeid)
    const nodeIdFolder = folder.children.find(node => {
      const nodeId = node.nodeId || node.file.downloadId[1]
      return (node.name + '.' + nodeId) === folderName
    })

    if (nodeIdFolder) {
      folder = nodeIdFolder
      return
    }

    // Then try case sensitive matches...
    const childFolder = folder.children.find(node => {
      return node.name === folderName
    })

    if (childFolder) {
      folder = childFolder
      return
    }

    // ... but allow case insensitive too
    const folderNameLower = folderName.toLowerCase()
    const childFolderInsensitive = folder.children.find(node => {
      return node.name.toLowerCase() === folderNameLower
    })

    if (childFolderInsensitive) {
      folder = childFolderInsensitive
      return
    }

    folder = null
  })

  return folder
}

exports.applyConnectionSettings = applyConnectionSettings
exports.downloadFolder = downloadFolder
exports.createFileList = createFileList
exports.downloadFileTo = downloadFileTo
exports.createFileProgressStream = createFileProgressStream
exports.getNodeByPath = getNodeByPath
exports.fileSize = fileSize
exports.parseFileSize = parseFileSize
