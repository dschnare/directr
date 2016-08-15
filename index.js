var path = require('path')
var readDirectivesFromText = require('./lib/parsing/readDirectivesFromText')
var readDirectivesFromFiles = require('./lib/parsing/readDirectivesFromFiles')
var processDirectives = require('./lib/processing/processDirectives')
var inferDependencies = require('./lib/util/inferDependencies')
var tryRequire = require('./lib/util/tryRequire')

exports.readDirectivesFromText = readDirectivesFromText
exports.readDirectivesFromFiles = readDirectivesFromFiles
exports.processDirectives = processDirectives
exports.inferDependencies = inferDependencies

exports.directr = function (sourceFiles, configPathOrConfig, callback) {
  var config = configPathOrConfig
  var baseDir = process.cwd()

  if (typeof configPathOrConfig === 'string') {
    config = tryRequire(path.resolve(configPathOrConfig)) || {}
    baseDir = path.dirname(configPathOrConfig)
  }

  if (config.compilerOptions === false) {
    config.compilerOptions = {
      noResolve: true
    }
  }

  var files = inferDependencies(sourceFiles, config.compilerOptions || {}, baseDir)
  readDirectivesFromFiles(files, function (error, directives) {
    if (error) {
      callback(error)
      return
    }

    var processors = config.directiveProcessors || {}
    var context = config.context || {}

    context.project = baseDir

    processDirectives(directives, processors, context, callback, baseDir)
  })
}
