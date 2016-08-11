var fs = require('fs')
var path = require('path')
var ts = require('typescript')

module.exports = function processCompilerOptions (compilerOptions, baseDir) {
  if (typeof compilerOptions === 'string') {
    // See: https://github.com/Microsoft/TypeScript/blob/59d1f1f8ab6e0c736fb1440543156e6ac623cbae/tests/baselines/reference/APISample_parseConfig.js
    var text = fs.readFileSync(path.resolve(baseDir, compilerOptions), { encoding: 'utf8' })
    var parseResult = ts.parseConfigFileTextToJson(compilerOptions, text)

    if (parseResult.error) {
      throw parseResult.error
    } else {
      var compilerOptionsFileName = compilerOptions
      compilerOptions = parseResult.config.compilerOptions
      if (!('allowJs' in compilerOptions)) {
        compilerOptions.allowJs = path.basename(compilerOptionsFileName) === 'jsconfig.json'
      }
    }
  }

  if (compilerOptions) {
    var settings = ts.convertCompilerOptionsFromJson(compilerOptions, baseDir)
    if (!settings.options) {
      settings.errors.forEach(function (err) {
        console.log(err)
      })
      throw new Error('Failed to parse the compiler settings.')
    } else {
      compilerOptions = settings.options
    }
  }

  return compilerOptions || {}
}
