# @pixelbits/jsondiff

Performs a deep comparison of two objects, and returns a json object that represents the difference.

> UMD bundle is 1,314 minified+gzipped

## Getting Started

### Example Usage

```ts
import * as jsondiff from '@pixelbits/jsondiff'

const x = {
	foo: { bar: 3 },
	array: [{
		does: 'work',
		too: [ 1, 2, 3 ]
	}]
}

const y = {
	foo: { baz: 4 },
	quux: 5,
	array: [{
		does: 'work',
		too: [ 4, 5, 6 ]
	}, {
		really: 'yes'
	}]
}

const output = {
    foo: { bar: null, baz: 4 },
    quux: 5,
    array: [{ 
        too: [4, 5, 6]
    }, { 
        really: 'yes' 
    }],
}

jsondiff.diff(x, y) // => output
```


### Installation

With [npm](http://npmjs.org) do:

```sh
npm install @pixelbits/jsondiff
```

UMD package available under dist folder: dist/umd.js
<!-- 
@pixelbits/jsondiff can be used directly in the browser without the use of package managers/bundlers as well:  [UMD version from unpkg.com](https://unpkg.com/deepmerge/dist/umd.js).
-->


### Include

@pixelbits/jsondiff exposes a CommonJS entry point:

```
const diff = require('@pixelbits/jsondiff')
```
Or can be imported in TypeScript as an ES6 module:

```
import * as jsondiff from '@pixelbits/jsondiff'
```
<!--
The ESM entry point was dropped due to a [Webpack bug](https://github.com/webpack/webpack/issues/6584).
-->

# API


## `jsondiff.diff(x, y, [Options])`

Diff two objects `x` and `y` deeply, returning a new transformation object where `x` + `transform` = `y`.

If an element at the same key is present for both `x` and `y`, and the value is the same, then the key will disappear from
the result.

Performing a diff creates a new object, so that neither `x` or `y` is modified.

**Note:** By default, arrays are diffed by comparing each element at its index.

## Options

### `MergeDirection.Both`

Merges all properties from `x` and all properties from `y` before performing a diff.

```ts
jsondiff.diff(
	{ foo: 'bar' },
	{ foo: 'bar2' },
    MergeDirection.Both
) // => { foo: 'bar2' }
```

### `MergeDirection.Right`

Merges properties from `x` and compares them against the same properties from `y`.

```ts
jsondiff.diff(
	{ foo: 'bar' },
	{ foo: 'bar2', test: 'test' },
    MergeDirection.Right
) // => { foo: 'bar2' }
```

### `MergeDirection.Left`

Merges properties from `y` and compares them against the same properties from `x`.

```ts
jsondiff.diff(
	{ foo: 'bar' },
	{ foo: 'bar2', test: 'test' },
    MergeDirection.Left
) // => { foo: 'bar2', test: 'test' }
```


# License

MIT