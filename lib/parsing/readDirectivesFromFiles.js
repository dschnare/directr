var fs = require('fs')
var readDirectivesFromText = require('./readDirectivesFromText')
var asyncMap = require('../util/asyncMap')

function readDirectives (fileName, text) {
  return readDirectivesFromText(text)
    .map(function (directive) {
      directive.file = { name: fileName, text: text }
      return directive
    })
}

module.exports = function readDirectivesFromFiles (files, callback) {
  asyncMap(files, function (file, i, _, done) {
    if (typeof file === 'string') {
      fs.readFile(file, { encoding: 'utf8' }, function (error, text) {
        if (error) {
          done(error)
        } else {
          try {
            var directives = readDirectives(file, text)
            done(null, directives)
          } catch (err) {
            done(err)
          }
        }
      })
    } else if ('fileName' in file && 'text' in file) {
      var directives = readDirectives(file.fileName, file.text)
      done(null, directives)
    } else {
      done(new Error('Invalid file encountered.'))
    }
  }, function (error, directives) {
    if (error) {
      callback(error)
    } else {
      // Flatten array of array of directives.
      directives = directives.reduce(function (array, list) {
        return array.concat(list)
      }, [])
      callback(null, directives)
    }
  })
}
