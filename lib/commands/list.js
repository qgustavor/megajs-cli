const mega = require('megajs')
const { applyProxySettings, getNodeByPath, createFileList, fileSize } = require('../util')
const { getLoggedAccount } = require('../login-handler')

exports.command = 'list [paths..]'
exports.aliases = 'ls'
exports.describe = 'Lists files in remote folders'
exports.builder = Object.assign({}, require('../options').optionalLoggedInOptions, {
  human: {
    alias: 'H',
    describe: 'format size values instead of returning bytes',
    type: 'boolean'
  },
  'long': {
    alias: 'l',
    describe: 'long format, showing node handle, node owner, node type, size, modification date, then filename',
    type: 'boolean'
  },
  header: {
    describe: 'add an header to the result',
    type: 'boolean'
  },
  names: {
    alias: 'n',
    describe: 'show file names instead of full paths and hide folders',
    type: 'boolean'
  },
  recursive: {
    alias: 'R',
    describe: 'list all files and folders recursively, default when no path specified',
    type: 'boolean'
  },
  'export': {
    alias: 'e',
    describe: 'export the selected file or folder',
    type: 'boolean'
  },
  key: {
    alias: 'k',
    describe: 'exported folder key (22 character string ending with A, Q, g or w)',
    type: 'string',
    requiresArg: true
  }
})

const openedHandles = []

function closeHandles () {
  openedHandles.forEach(handle => handle.close())
}

exports.handler = (options) => {
  let { paths } = options
  if (!paths.length) {
    paths = ['/Root']
    options.recursive = true
  }

  doPathLoop(paths, options)
}

function doPathLoop (paths, options) {
  if (!paths.length) return closeHandles()

  const path = paths.shift()
  handlePath(path, options, () => {
    doPathLoop(paths, options)
  })
}

function handlePath (path, options, cb) {
  if (path.charAt(0) === '/') {
    listLoggedFiles(path, options, cb)
  } else {
    listSharedFiles(path, options, cb)
  }
}

function listLoggedFiles (path, options, cb) {
  const parsedPath = path.split('/').filter(e => e)

  if (parsedPath.shift().toLowerCase() !== 'root') {
    console.error('ERROR: only listing /Root and its children is supported')
    process.exit(1)
  }

  getLoggedAccount(options, (err, storage) => {
    if (err) {
      console.error(err.message)
      cb()
    }

    openedHandles.push(storage)

    let node = getNodeByPath(parsedPath, storage.root)
    if (!node) {
      console.error('ERROR: target folder not found')
      process.exit(1)
    }

    if (options.export) {
      exportFile(options, node, cb)
    } else {
      printList(options, node, cb)
    }
  })
}

function listSharedFiles (path, options, cb) {
  let node
  try {
    // fromURL throws if the URL is not valid
    node = mega.File.fromURL(path)
  } catch (error) {
    console.error(error.message)
    process.exit(1)
  }

  applyProxySettings(node.api, options.proxy)

  node.loadAttributes((err, node) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    printList(options, node, cb)
  })
}

function exportFile (options, node, cb) {
  node.link({
    key: options.key
  }, (err, url) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    console.log(url)
    cb()
  })
}

function printList (options, node, cb) {
  const FILENAME_LABEL = options.names ? 'Filename' : 'Path'
  const FILENAME_FN = n => options.names
    ? (n.file.name || '[encrypted filename]')
    : n.filePath

  const MODES = {
    short: [[FILENAME_LABEL, FILENAME_FN]],
    long: [
      ['Handler', n => n.file.nodeId || n.file.downloadId[1] || n.file.downloadId],
      ['Owner', n => n.file.owner || (n.file.storage ? n.file.storage.user : '')],
      ['T', n => n.file.type],
      ['Size', n => n.file.directory ? '-' : options.human ? fileSize(n.file.size) : n.file.size],
      ['Mod. Date', n => new Date(n.file.timestamp * 1000).toISOString().replace('T', ' ').slice(0, 19)],
      [FILENAME_LABEL, FILENAME_FN]
    ]
  }

  const mode = options.long ? MODES.long : MODES.short
  const listedNodes = createFileList(node, '/', {
    andSelf: !options.names,
    recursive: !!options.recursive
  })

  const data = []
  listedNodes.forEach((node) => {
    const line = mode.map((info) => {
      return info[1](node).toString()
    })

    data.push(line)
  })

  const maxWidths = mode.map(e => options.header ? e[0].length : 0)
  data.forEach((line) => {
    line.forEach((value, index) => {
      maxWidths[index] = Math.max(maxWidths[index], value.length)
    })
  })

  if (options.header) {
    const header = mode.map((info, index) => {
      const text = info[0]
      return [text, ' '.repeat(maxWidths[index] - text.length)][index === 3 ? 'reverse' : 'slice']().join('')
    }).join(' ')

    console.log('='.repeat(header.length))
    console.log(header)
    console.log('='.repeat(header.length))
  }

  data.forEach((line) => {
    console.log(line.map((text, index) => {
      return [text, ' '.repeat(maxWidths[index] - text.length)][index === 3 ? 'reverse' : 'slice']().join('')
    }).join(' '))
  })

  cb(null)
}
