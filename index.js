var readDirectivesFromText = require('./lib/parsing/readDirectivesFromText')
var readDirectivesFromFiles = require('./lib/parsing/readDirectivesFromFiles')
var processDirectives = require('./lib/processing/processDirectives')
var inferDependencies = require('./lib/util/inferDependencies')

exports.readDirectivesFromText = readDirectivesFromText
exports.readDirectivesFromFiles = readDirectivesFromFiles
exports.processDirectives = processDirectives
exports.inferDependencies = inferDependencies
