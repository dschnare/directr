var path = require('path')
var consumeArg = require('../commandline/consumeArg')
var tryRequire = require('../util/tryRequire')
var inferDependencies = require('../util/inferDependencies')
var readDirectivesFromFiles = require('../parsing/readDirectivesFromFiles')
var processDirectives = require('../processing/processDirectives')

var args = process.argv.slice(2)
var configFile = consumeArg(args, '--config') || path.resolve('directiveconfig.json')
var showHelp = consumeArg(args, '--help') || false
var baseDir = path.dirname(configFile)
var config = tryRequire(path.resolve(configFile)) || {}
var files = args

if (showHelp || files.length === 0) {
  console.log([
    'Usage:',
    'directr [--config filepath] [--help] {sourcefiles...}'
  ].join('\n'))
  process.exit(files.length === 0 ? 1 : 0)
}

if (config.compilerOptions === false) {
  config.compilerOptions = {
    noResolve: true
  }
}

files = inferDependencies(files, config.compilerOptions || {}, baseDir)
readDirectivesFromFiles(files, function (error, directives) {
  if (error) throw error

  var processors = config.directiveProcessors || {}
  var context = config.context || {}

  processDirectives(directives, processors, context, function (error) {
    if (error) throw error
  }, baseDir)
})
