# directr

**directr** is a JavaScript directive processor command line tool and library.


# Install

    npm install directr -g


# Usage

    directr [--config config path] [--help] {sourcefiles...}


# Directives

Directives are special JavaScript comments of the form:

    // @{directiveName} [space separated params...]

Example:

    // @myDirective 34 "param2 text"

Directive parameters can be a null, undefined, number, boolean, single or
double quoted string, unquoted single word string, an object literal or an
array literal, or a global reference.

    // @myDirective null undefined 34.4 false "text with spaces"
    // @otherDirective word String { name: 'object literal', list: [1,2,3] } [ { name: 'array literal' } ]

For directives that only accept a single Object or Array literal there is an
alternate block-syntax that can be used.

    /* @{directiveName}
    Object or Array literal
    */

Example:

    /* @myDirective
    {
      name: 'object literal',
      list: [1, 2, 3, 4]
    }
    */

The following globals are available to be referenced in Object or Array
literals or as a plain reference.

- String
- Array
- Boolean
- Date
- Object
- Number
- JSON
- RegExp

When passing an Object or Array literal the following symbols/characters are
illegal.

- new
- this
- window
- global
- `++`
- `--`
- the following characters: `=()`

**directr** recognizes these comments in your source files and will parse them
into objects that look like this.

    {
      name: '@directiveName',
      params: [param1, param2, ...],
      index: 0-based-index,
      line: 1-based-number,
      position: 1-based-character-position,
      file: { name: filePath, text: fileText }
    }

Each directive encountered can be passed to a processor for processing. You
configure the processors using a JSON file, typically with the name
`directiveconfig.json`.

    {
      "directiveProcessors": {
        "@myDirective": "./path/relative/to/directiveconfig.json",
        "@other": "topLevelNodeModule"
      }
    }

**directr** will load your configuration file from the current directory if not
specified on the command line.

Loads `directiveconfig.json` from the current directory.

    directr app.js

Loads your own config with custom file name.

    directr --config myconfig.json app.js

Sometimes when processing directives you need settings or some options to be
passed to the processor. You do this by setting the `context` config setting.

    {
      "directiveProcessors": {
        "@myDirective": {
          "module": "./path/relative/to/config",
          "context": {
            "property1": 45
          }
        }
      }
    }

Contexts in the config will be merged with the top-level context.

    {
      "directiveProcessors": {
        "@myDirective": {
          "module": "./path/relative/to/directiveconfig.json",
          "context": {
            "property1": 45
          }
        }
      },
      "context": {
        "description": "this is the top-level context"
      }
    }

The resulting context object passed to the loaded processor module would be:

    {
      property1: 45,
      description: "this is the top-level context"
    }

Directive processors are just modules that export a function with the following
signature.

    function myDirectiveProcessor (directive, context, done)

Where `directive` is the object the directive is parsed into, `context` is the
merged top-level and processor-level contexts, and `done` is a standard
error first Node-style callback that should be called when processing is
complete.

    // directives/hello.js
    module.exports = function helloProcessor (directive, context, done) {
      console.log('found @hello directive in file:', directive.file.name)
      done()
    }

    // directiveconfig.json
    {
      "directiveProcessors": {
        "@hello": "./directives/hello"
      }
    }


# Module Dependencies

Under the hood **directr** uses the [TypeScript](http://www.typescriptlang.org/)
compiler to look for dependencies between your JavaScript and TypeScript
modules. These dependent modules will also have their directives processed. By
using the TypeScript compiler **directr** can infer dependencies between AMD,
CommanJS and ES6 modules interchangably, as well as be able to handle JSX
syntax. The TypeScript compiler can have options passed to it via the
`compilerOptions` config setting.

    {
      "compilerOptions": "./jsconfig.json",
      "directiveProcessors": {
        "@hello": "./directives/hello"
      }
    }

The `compilerOptions` config setting can either be a path relative to the
`directiveconfig.json` file to a `tsconfig.json` or `jsconfig.json` file, or an
object with any of the supported
[compiler options](https://www.typescriptlang.org/docs/handbook/compiler-options.html).

**directr** uses the TypeScript compiler just to infer dependencies so no code
will be emitted or errors reported. The following compiler options will be
overridden to ensure this happens.

- *modeulResolution* Always set to `"node"`
- *noEmit* Always set to `true`
- *allowJs* Defaults to `true` if not specified
- *listFiles* Always set to `false`
- *watch* Always set to `false`
- *sourceMap* Always set to `false`
- *inlineSourceMap* Always set to `false`
- *outDir* Always set to `null`
- *outFile* Always set to `null`

*NOTE: If you do not want to have TypeScript infer your dependencies then set
the `compilerOptions` config setting to `false`.*


# JSON Schema

If you use an IDE or editor that supports JSON schema files then you can take
advantage of the JSON schema available for the `directiveconfig.json` config
file. You just need to set `$schema` in your config file to the schma file.

    {
      "$schema": "./node_modules/directr/schema/directiveconfig.json",
      ...
    }

Now you'll get inline completion and code hints as you type.


# Programmatic API

`readDirectivesFromText(text)`

Reads the directives from the specified text string. Returns an array of
objects of the form:

    { name, params: [param1, param2] }

`readDirectivesFromFiles(fileNames, callback)`

Reads the directives from each file specified. Calls `callback` with an error
as the first argument if an error occurs. Sends an array of objects with the
following form as the second arguemnt to `callback` on success.

    { name, params: [param1, param2], file: { name, text } }

`inferDependencies(fileNames, compilerOptions, [baseDir])`

Infers module dependencies from each specified file name, taking care of
duplicates. Where `compilerOptions` can either be a path to the TypeScript
compiler config file or an object with compiler options defined. If the
`compilerOptions` is a string then it is treated as though it were relative
to `baseDir`. If `baseDir` is not specified then `process.cwd()` is its default
value.

`processDirectives(directives, processorMap, context, callback, [baseDir])`

Attempts to process all specified directives as returned from one of the
`readDirectivesFromXXX` functions. Where `processorMap` is an object that maps
directive names to either a module name, function or an object of the form:
`{ module, [context] }`; where `module` is a module name to load or a function
and `context` is the optional processor-level context to pass to the processor.
`context` is the top-level context object that will be merged with any
processor-level context before processing a directive. `baseDir` is the base
directory to resolve relative module names. If `baseDir` is not specified then
it will default to `process.cwd()`.

Example:

    var directr = require('directr')
    var files = ['app.js']
    var compilerOptions = './jsconfig.json'
    var baseDir = process.cwd()
    var topLevelContext = {}
    var directiveProcessors = {
      '@hello': './directives/hello',
      '@other': function (directive, context, done) {
        // TODO: implement
        done()
      },
      '@something': {
        module: function (directive, context, done) {
          // TODO: implement
          done()
        }
      }
    }

    files = directr.inferDependencies(files, compilerOptions, baseDir)
    directr.readDirectivesFromFiles(files, function (error, directives) {
      if (error) throw error
      directr.processDirectives(directives, directiveProcessors, topLevelContext, function (error) {
        if (error) throw error
      }, baseDir)
    })
