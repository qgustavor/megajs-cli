#!/usr/bin/env node

const pkg = require('../package.json')
const updateNotifier = require('update-notifier')({ pkg })
updateNotifier.notify({ defer: true })

const mega = require('megajs')

throw Error('Work in progress')