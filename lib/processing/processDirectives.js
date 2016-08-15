var asyncEach = require('../util/asyncEach')
var tryRequire = require('../util/tryRequire')

module.exports = function processDirectives (directives, processorMap, context, callback, baseDir) {
  baseDir = baseDir || process.cwd()

  asyncEach(directives, function (directive, i, _, done) {
    if (directive.name in processorMap) {
      // entry can be string or { module, context }
      var entry = processorMap[directive.name]
      var processor = null
      var ctx = Object.create(context)

      if (!entry) {
        done(new Error('Directive processor module invalid: ' + directive.name))
        // EXIT
        return
      }

      if (typeof entry === 'string') {
        entry = { module: entry, context: null }
      } else if (typeof entry === 'function') {
        entry = { module: entry, context: null }
      }

      if (typeof entry.module === 'string') {
        processor = tryRequire(entry.module, baseDir)
        if (processor === null) {
          done(new Error('Directive processor module not found: ' + entry.module))
          // EXIT
          return
        }
      } else if (typeof entry.module === 'function') {
        processor = entry.module
      }

      if (entry.context) {
        cx = Object.create(ctx)
        Object.keys(entry.context).forEach(function (key) {
          ctx[key] = entry.context[key]
        })
      }

      if (typeof processor === 'function') {
        try {
          for (var key in ctx) {
            if (typeof ctx[key] === 'string' && ctx[key]) {
              ctx[key] = format(ctx[key], ctx)
            }
          }
          processor(directive, ctx, done)
        } catch (error) {
          done(error)
        }
      } else {
        process.nextTick(done)
      }
    } else {
      process.nextTick(done)
    }
  }, callback)
}

function format (text, context) {
  return text.replace(/\$\{\s*([^} ]+)\s*\}/g, function ($0, propertyPath) {
    var segs = propertyPath.split('.')
    var key = segs.pop()
    var o = context

    while (segs.length) {
      if (segs[0] in o) {
        o = [o[segs.shift()]]
      } else {
        return ''
      }
    }

    if (key in o) {
      var value = o[key]
      if (typeof value && value) {
        value = format(value, context)
      }
      return value
    } else {
      return ''
    }
  })
}
