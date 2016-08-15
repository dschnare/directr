# 2.1.1

*August 15, 2016*

Resolve misleading description for directiveProcessors properties.
The description now correctly states that all directive names must
start with '@@'.

# 2.1.0

*August 15, 2016*

Add `directr()` export. This makes it easier to mimic the config loading
behaviour exhibited by the `directr` command line tool.

Add the `project` property to the top-level context. This makes it possible to
specify file paths in the context that are always relative to the config file
instead of the current working directory.

# 2.0.0

*August 15, 2016*

Change re-thrown error into a console.error() call. This prevents a try-catch
in the processing code from catching the re-thrown error in the commandline
handler.

Add support for the ':' and '$' characters to directive names. The ':'
character is usefule for designating namespaces in a directive name and the
'$' character might be useful in the future.

Add support for formatted strings in the context. String values on the context
will have tokens of the form '${contextPropertyName}' recursively expanded.

Resolve an issue of calling the callback directly in the internal asyncMap
library function. Call done() as expected.

Change directive prefix from '@' to '@@' to avoid conflicts with JSDoc tags.

Change format of CHANGELOG to better resemble a git commit message.

BREAKING CHANGE

All directives with prefix '@' must be prefixed with '@@'.


# 1.1.0

*August 11, 2016*

Add index, line and position to the directive object when a directive is
encountered. This provides the capability to processors to find the exact
location within a file where the directive was found.

Add support for block-syntax for directives that only support a single
Object or Array literal parameter.

# 1.0.2

*August 11, 2016*

Override watch, sourceMap, inlineSourceMap, outDir and outFile TypeScript
compiler options.

Update readme to reflect the overridden compiler options.

# 1.0.1

*August 11, 2016*

Rename readme file so it has a correct file name.

Update the roadmap.

Add author field to package.json.

# 1.0.0

*August 11, 2016*

Inital release.