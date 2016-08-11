module.exports = function asyncMap (array, visitor, callback) {
  var i = 0
  var len = array.length
  var done = false

  function next (error) {
    if (done) throw new Error('Cannot call callback that has already been called.')
    if (error) {
      done = true
      callback(error)
    } else if (i < len) {
      try {
        visitor(array[i], i++, array, next)
      } catch (err) {
        done = true
        callback(err)
      }
    } else {
      done = true
      callback()
    }
  }

  next()
}
