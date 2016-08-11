module.exports = function consumeArg (args, argName) {
  return args
    .reduce(function (theResult, arg, index) {
      if (arg.indexOf(argName) === 0) {
        return [{ index: index, arg: arg }]
      }
      return theResult
    }, [])
    .reduce(function (_, result) {
      if (result.arg.indexOf('=') > 0) {
        args.splice(result.index, 1)
        return result.arg.split('=').pop().trim()
      } else {
        var nextArg = args[result.index + 1]
        if (!nextArg || nextArg.indexOf('-') === 0) {
          args.splice(result.index, 1)
          return true
        } else if (nextArg.indexOf('-') !== 0) {
          args.splice(result.index, 2)
          return nextArg
        }
      }
    }, void 0)
}
