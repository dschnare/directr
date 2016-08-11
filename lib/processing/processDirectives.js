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
        ctx = Object.create(ctx)
        Object.keys(entry.context).forEach(function (key) {
          ctx[key] = entry.context[key]
        })
      }

      if (typeof processor === 'function') {
        try {
          processor(directive, ctx, done)
        } catch (error) {
          done(error)
        }
      } else {
        process.nextTick(done)
      }
    }
  }, callback)
}
