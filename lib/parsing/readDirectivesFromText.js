/* eslint no-new-func: 0 */
module.exports = function readDirectivesFromText (text) {
  var directives = []
  // @@\w+(\w|:|$)*
  var pattern = /\/+\s+(@@\w+(?:\w|:|\$)*)(.*)?/g
  var match = null

  /*
  Directives of the form:

  // @@directiveName param1 param2 ...
  */
  match = pattern.exec(text)
  while (match) {
    directives.push({
      name: match[1],
      index: match.index, // 0-based
      line: (text.substr(0, match.index + 1).match(/\n/g) || []).length + 1, // 1-based
      position: match.index - text.substr(0, match.index + 1).lastIndexOf('\n'), // 1-based
      params: parseParams(match[2] || '')
    })
    match = pattern.exec(text)
  }

  /*
  Directives of the form:

  /_* @@directiveName
  Object or Array literal
  *_/
  */
  pattern = /\/\*+[\s\n]*(@@\w+(?:\w|:|\$)*)\n((?:\{|\[)[^*]+?)\*+\//g
  match = pattern.exec(text)
  while (match) {
    directives.push({
      name: match[1],
      index: match.index, // 0-based
      line: text.substr(0, match.index + 1).match(/\n/g).length + 1, // 1-based
      position: match.index - text.substr(0, match.index + 1).lastIndexOf('\n'), // 1-based
      params: parseParams(match[2] || '')
    })
    match = pattern.exec(text)
  }

  return directives
}

// The globals that Array and Object literals have access to.
var GLOBALS = Object.create(null)
GLOBALS.String = String
GLOBALS.Array = Array
GLOBALS.Boolean = Boolean
GLOBALS.Object = Object
GLOBALS.Date = Date
GLOBALS.Number = Number
GLOBALS.JSON = JSON
GLOBALS.RegExp = RegExp

function parseParams (paramString) {
  var k = -1
  var c = ''
  var params = []
  var param = ''
  var withinString = false
  var arrayOpenBrackets = 0
  var objectOpenBrackets = 0

  paramString = paramString.trim() + ' '
  c = paramString[++k]

  while (c) {
    if (c === '\\') {
      c = paramString[++k]
      if (c) param += c
    } else if (!objectOpenBrackets && !arrayOpenBrackets && (c === '"' || c === '\'')) {
      withinString = !withinString
      param += c
    } else if (c === '{') {
      objectOpenBrackets += 1
      param += c
    } else if (c === '}') {
      objectOpenBrackets -= 1
      param += c
      if (arrayOpenBrackets === 0 && objectOpenBrackets === 0) {
        params.push(Function('g', 'with(g) { return ' + param + '}')(GLOBALS))
        param = ''
      } else if (arrayOpenBrackets < 0) {
        throw new Error('Invalid Object literal in params.\nPARAMS:' + paramString)
      }
    } else if (c === '[') {
      arrayOpenBrackets += 1
      param += c
    } else if (c === ']') {
      arrayOpenBrackets -= 1
      param += c
      if (arrayOpenBrackets === 0 && objectOpenBrackets === 0) {
        params.push(Function('g', 'with(g) { return ' + param + '}')(GLOBALS))
        param = ''
      } else if (arrayOpenBrackets < 0) {
        throw new Error('Invalid Array literal in params.\nPARAMS:' + paramString)
      }
    } else if (!withinString && !arrayOpenBrackets && !objectOpenBrackets && c <= ' ') {
      if (param) {
        // Boolean
        if (param === 'false' || param === 'true') param = param === 'true'
        // Number
        if (!isNaN(param)) param = parseFloat(param)
        // Null
        if (param === 'null') param = null
        // Undefined
        if (param === 'undefined') param = undefined
        // Quoted string
        if (param[0] === '"' || param[0] === '\'') param = param.substr(1, param.length - 1)
        // Global reference
        if (param in GLOBALS) param = GLOBALS[param]
        // Otherwise a string without quotes.
        params.push(param)
        param = ''
      }
    } else if ((objectOpenBrackets || arrayOpenBrackets) && !withinString && isIllegal(c)) {
      throw new Error('Illegal character found in Array or Object literal.\nPARAMS: ' + paramString + '\nCHARACTER: ' + c)
    } else if ((objectOpenBrackets || arrayOpenBrackets) && !withinString && paramString.substr(k, 2) === '++') {
      throw new Error('Illegal increment operator in Array or Object literal.\nPARAMS: ' + paramString)
    } else if ((objectOpenBrackets || arrayOpenBrackets) && !withinString && paramString.substr(k, 2) === '--') {
      throw new Error('Illegal decrement operator in Array or Object literal.\nPARAMS: ' + paramString)
    } else if ((objectOpenBrackets || arrayOpenBrackets) && !withinString && paramString.substr(k, 3) === 'new') {
      throw new Error('Illegal constructor invocation in Array or Object literal.\nPARAMS: ' + paramString)
    } else if ((objectOpenBrackets || arrayOpenBrackets) && !withinString && paramString.substr(k, 6) === 'window') {
      throw new Error('Illegal reference to "window" in Array or Object literal.\nPARAMS: ' + paramString)
    } else if ((objectOpenBrackets || arrayOpenBrackets) && !withinString && paramString.substr(k, 6) === 'global') {
      throw new Error('Illegal reference to "global" in Array or Object literal.\nPARAMS: ' + paramString)
    } else if ((objectOpenBrackets || arrayOpenBrackets) && !withinString && paramString.substr(k, 4) === 'this') {
      throw new Error('Illegal reference to "this" in Array or Object literal.\nPARAMS: ' + paramString)
    } else {
      param += c
    }

    c = paramString[++k]
  }

  if (objectOpenBrackets || arrayOpenBrackets) {
    throw new Error('Invalid Array or Object literal in params.\nPARAMS: ' + paramString)
  }

  return params
}

var ILLEGAL_CHARS = '=()'
function isIllegal (c) {
  return ILLEGAL_CHARS.indexOf(c) >= 0
}
