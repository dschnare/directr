var path = require('path')
var consumeArg = require('../commandline/consumeArg')
var directr = require('../../index').directr

var args = process.argv.slice(2)
var configFile = consumeArg(args, '--config') || path.resolve('directiveconfig.json')
var showHelp = consumeArg(args, '--help') || false
var baseDir = path.dirname(configFile)
var files = args

if (showHelp || files.length === 0) {
  console.log([
    'Usage:',
    'directr [--config filepath] [--help] {sourcefiles...}'
  ].join('\n'))
  process.exit(files.length === 0 ? 1 : 0)
}

directr(files, configFile, function (error) {
  if (error) console.error(error.stack)
})
