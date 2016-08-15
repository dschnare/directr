var asyncEach = require('./asyncEach')

module.exports = function asyncMap (array, visitor, callback) {
  var result = []

  asyncEach(array, function (value, i, array, done) {
    visitor(value, i, array, function next (error, value) {
      if (next.done) throw new Error('Cannot call callback that has already been called.')
      if (error) {
        next.done = true
        done(error)
      } else {
        next.done = true
        result[i] = value
        done()
      }
    })
  }, function (error) {
    callback(error, result)
  })
}
