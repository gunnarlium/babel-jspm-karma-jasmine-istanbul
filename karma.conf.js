/* global module */
module.exports = function (config) {
	'use strict';
	config.set({
		autoWatch: true,
		singleRun: true,

		frameworks: ['jspm', 'jasmine'],

		files: [
			'node_modules/babel-polyfill/dist/polyfill.js'
		],

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
			'/src/': '/base/src/',
			'/jspm_packages/': '/src/jspm_packages/'
		},

		browsers: ['ChromeHeadless'],

		preprocessors: {
			'src/!(*spec).js': ['babel', 'sourcemap', 'coverage']
		},

		babelPreprocessor: {
			options: {
				sourceMap: 'inline'
			},
			sourceFileName: function(file) {
				return file.originalPath;
			}
		},

		reporters: ['coverage', 'progress'],

		coverageReporter: {
			instrumenters: {isparta: require('isparta')},
			instrumenter: {
				'src/*.js': 'isparta'
			},

			reporters: [
				{
					type: 'text-summary',
					subdir: normalizationBrowserName
				},
				{
					type: 'html',
					dir: 'coverage/',
					subdir: normalizationBrowserName
				}
			]
		}
	});

	function normalizationBrowserName(browser) {
		return browser.toLowerCase().split(/[ /-]/)[0];
	}
};
