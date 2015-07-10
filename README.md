Babel JSPM Karma Jasmine Istanbul Coverage Test
===============================================

A sample repo to show what's need to get HTML code coverage reports working when using [Babel](https://babeljs.io/), [JSPM](http://jspm.io/), [Karma](http://karma-runner.github.io/), [Jasmine](http://jasmine.github.io/) and [Istanbul](https://github.com/gotwarlost/istanbul).

To install and run:

	$ npm install
	$ jspm install
	$ karma start karma.conf.js
	$ open coverage/phantomjs/index.html

Tutorial
--------

When living on the edge, getting the tooling of the past to work as expected requires a bit of extra work. I'll walk you through the steps you need to get set up.

### The goal

Set up Karma testing with code coverage for a project that uses Babel, JSPM and Jasmine.

### The problem

Both your tests and your code written in ES6 need to be transpiled to ES5 before being run. However, you want your code coverage report to show you the files as they were before transpilation, so you recognize the content.

### The solution

Use source maps to make the generated HTML match you're original files.

Bootstrapping your project
--------------------------

Make sure you have jspm installed globally.

	$ npm install -g jspm

Init JSPM:

	$ jspm init

Use the defaults for everything except `server baseURL`, set this to `src`. It should look something like this:

```
$ jspm init
Package.json file does not exist, create it? [yes]:
Would you like jspm to prefix the jspm package.json properties under jspm? [yes]:
Enter server baseURL (public folder path) [./]:src
Enter jspm packages folder [src/jspm_packages]:
Enter config file path [src/config.js]:
Configuration file src/config.js doesn't exist, create it? [yes]:
Enter client baseURL (public folder URL) [/]:
Which ES6 transpiler would you like to use, Traceur or Babel? [babel]:
```

With package.json created, also lock down the version of jspm:

	$ npm install --save-dev jspm

As the purpose is to get tests set up, we'll start by writing a simple test. In `src/hello.spec.js`, enter:

```js
'use strict';

import {hello} from './hello';

describe('hello', () => {

	it('should return Hello Foo', function () {
		expect(hello()).toEqual('Hello Foo');
	});
});

```

We're using a little bit of ES6 here, to show that your tests can also be written in ES6.

Go ahead an create the implementation at the same time. In `src/hello.js` enter:

```js
'use strict';

export function hello() {
	let name = 'Foo';
	let greeting = `Hello ${name}`;

	if (false) {
		// Should not be covered
		return 'Good bye';
	}

	return greeting;
}
```


Setting up the test environment
-------------------------------

With our test written, it's time to start adding a few test related dependencies, so we can run it.

First, let's install the basics needed for Jasmine and Karma with PhantomJS:

	$ npm install --save-dev phantomjs jasmine jasmine-core karma karma-jasmine karma-phantomjs-launcher karma-jspm

Also, create a simple `karma.conf.js`:

```js
/* global module */
module.exports = function (config) {
	'use strict';
	config.set({
		autoWatch: true,
		singleRun: true,

		frameworks: ['jspm', 'jasmine'],

		jspm: {
			config: 'src/config.js',
			loadFiles: [
				'src/*.spec.js'
			],
			serveFiles: [
				'src/!(*spec).js'
			]
		},

		proxies: {
			'/base': '/base/src'
		},

		browsers: ['PhantomJS'],

		reporters: ['progress'],

	});

};

```

At this point, you should be able to run `karma start karma.conf.js`, but it will error without much explanation, as your transpiling isn't quite ready yet. You need to install `karma-babel-preprocessor`:

	$ npm install --save-dev karma-babel-preprocessor

Load the polyfill in your Karma config:

```js
files: [
	'node_modules/karma-babel-preprocessor/node_modules/babel-core/browser-polyfill.js'
]
```

This is needed since SystemJS depends on `Function.bind()`, which is not supported in PhantomJS.

If you rerun Karma, your tests should be passing. If you didn't care about HTML coverage reports, you could go on your way, and have a fully working ES6, Karma, Jasmine, JSPM and Babel setup. Not too bad!

Coverage
--------

For coverage reports, we'll use Istanbul and the Karma coverage  plugin:

	$ npm install --save-dev istanbul karma-coverage

You also need to update your karma config:

```js
preprocessors: {
	'src/!(*spec).js': ['babel', 'coverage']
},

coverageReporter: {
	reporters: [
		{
			type: 'text-summary',
		},
		{
			type: 'html',
			dir: 'coverage/',
		}
	]
}

```

If you run your tests now, you should find a coverage report in the `coverage` folder, with proper highlighting of covered code. However, what you're seeing is the transpiled code. For this simple code, that shouldn't be too hard to mentally connect to your source files, but wouldn't it better if you could be looking at ES6 code instead? Let's fix that!

You'll need a couple more dependencies. First, we'll install [isparta](https://github.com/douglasduteil/isparta), which is designed to be used with Istanbul with Babel and Karma/Karma Coverage:

	$ npm install --save-dev isparta

isparta works as a custom instrumentor, which must be registred in Karma config:

```js
coverageReporter: {
	instrumenters: {isparta: require('isparta')},
	instrumenter: {
		'src/*.js': 'isparta'
	},

	reporters: [
		{
			type: 'text-summary',
		},
		{
			type: 'html',
			dir: 'coverage/',
		}
	]
}
```

If you're reading this in the future, your coverage report may already be showing you ES6 code. As I'm stuck in the past, I need to use a custom version of `karma-coverage`. Update your `package.json` to use `douglasduteil/karma-coverage#next`:

	"karma-coverage": "douglasduteil/karma-coverage#next"

Now you're almost there. Your tests are running, you get coverage reports, and their all in beatiful ES6. There's one problem, however. If you look closely at the coverage for `hello.js`, you'll see that the coverage is highlighting the wrong lines. We can fix this by adding source maps.

	$ npm install --save-dev karma-sourcemap-loader

In Karma config:

```js

preprocessors: {
	'src/!(*spec).js': ['babel', 'sourcemap', 'coverage']
},


babelPreprocessor: {
	options: {
		sourceMap: 'inline',
		blacklist: ['useStrict']
	},
	sourceFileName: function(file) {
		return file.originalPath;
	}
},
```

Again, if you're living in the future, this might already be working for you. If not, you need to use another custom version of a dependency, this time Istanbul:

	"istanbul": "gotwarlost/istanbul.git#source-map"

Boom! If you run Karma again, line highlighting should also be working.
