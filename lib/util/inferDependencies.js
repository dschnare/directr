var ts = require('typescript')
var processCompilerOptions = require('./processCompilerOptions')
var createCompilerHost = require('./createCompilerHost')

module.exports = function inferDependencies (sourceFiles, compilerOptions, baseDir) {
  compilerOptions = processCompilerOptions(compilerOptions, baseDir) || {}
  compilerOptions.listFiles = false
  compilerOptions.noEmit = true
  compilerOptions.watch = false
  compilerOptions.sourceMap = false
  compilerOptions.inlineSourceMap = false
  compilerOptions.outDir = null
  compilerOptions.outFile = null
  compilerOptions.allowJs = compilerOptions.allowJs === void 0 ? true : compilerOptions.allowJs
  compilerOptions.moduleResolution = ts.ModuleResolutionKind.NodeJs

  var host = createCompilerHost(compilerOptions)
  var program = ts.createProgram(sourceFiles, compilerOptions, host)
  program.emit()
  return program.getSourceFiles()
}
