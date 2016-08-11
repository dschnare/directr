var path = require('path')

module.exports = function tryRequire (moduleName, baseDir) {
  baseDir = baseDir || process.cwd()

  try {
    if (moduleName[0] === '.') {
      return require(path.resolve(baseDir, moduleName))
    } else {
      return require(moduleName)
    }
  } catch (e) {
    return null
  }
}
