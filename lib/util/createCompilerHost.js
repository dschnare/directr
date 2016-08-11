var ts = require('typescript')

module.exports = function createCompilerHost (compilerOptions) {
  return {
    getSourceFile: getSourceFile,
    getDefaultLibFileName: function () { return 'lib.d.ts' },
    writeFile: function (fileName, content) { return ts.sys.writeFile(fileName, content) },
    getCurrentDirectory: function () { return ts.sys.getCurrentDirectory() },
    getCanonicalFileName: function (fileName) { return ts.sys.useCaseSensitiveFileNames ? fileName : fileName.toLowerCase() },
    getNewLine: function () { return ts.sys.newLine },
    useCaseSensitiveFileNames: function () { return ts.sys.useCaseSensitiveFileNames },
    fileExists: fileExists,
    readFile: readFile,
    resolveModuleNames: resolveModuleNames
  }

  function fileExists (fileName) {
    return ts.sys.fileExists(fileName)
  }

  function readFile (fileName) {
    return ts.sys.readFile(fileName)
  }

  function getSourceFile (fileName, languageVersion, onError) {
    var sourceText = ts.sys.readFile(fileName)
    return sourceText !== undefined ? ts.createSourceFile(fileName, sourceText, languageVersion) : undefined
  }

  function resolveModuleNames (moduleNames, containingFile) {
    return moduleNames.map(function (moduleName) {
      // try to use standard resolution
      var result = ts.resolveModuleName(moduleName, containingFile, compilerOptions, { fileExists: fileExists, readFile: readFile })
      if (result.resolvedModule) {
        return result.resolvedModule
      }

      return undefined
    })
  }
}
