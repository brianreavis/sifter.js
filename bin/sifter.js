#!/usr/bin/env node

/**
 * Sifter CLI
 *
 * Copyright (c) 2013 Brian Reavis
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this
 * file except in compliance with the License. You may obtain a copy of the License at:
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF
 * ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 *
 * @author Brian Reavis <brian@thirdroute.com>
 */

var path      = require('path');
var fs        = require('fs');
var optimist  = require('optimist');
var cardinal  = require('cardinal');
var async     = require('async');
var csv       = require('csv-parse');
var Stream    = require('stream');
var humanize  = require('humanize');
var Sifter    = require('../lib/sifter');
var highlight = function(obj) { return cardinal.highlight(JSON.stringify(obj), {json: true}); };
var microtime;

try {
	microtime = require('microtime');
} catch(error) {
	microtime = {
		now: function now() {
			return +new Date();
		}
	};
}

var raw, data, result, t_start, t_end;
var argv = optimist
	.usage('Usage: $0 --query="search query" --fields=a,b')
	.default('direction', 'asc')
	.default('sort', '')
	.default('query', '')
	.default('fields', '')
	.describe('fields', 'Search fields (comma separated)')
	.describe('query', 'Search query')
	.describe('sort', 'Sort field')
	.describe('direction', 'Sort direction')
	.describe('file', 'CSV or JSON dataset')
	.argv;

/**
 * Reads input from file or stdin.
 *
 * @param {function} callback
 */
var step_read = function(callback) {
	var buffer = [];

	if (argv.file) {
		fs.readFileSync(argv.file, []);
		callback();
	} else {
		process.stdin.on('data', function(chunk) {
			buffer.push(chunk);
		});
		process.stdin.on('end', function() {
			raw = buffer.join('').replace(/^\s+|\s+$/g, '');
			callback();
		});
		process.stdin.resume();
		process.stdin.setEncoding('utf8');
	}
};

/**
 * Parses input input data into an array of
 * an items that can be sifted through.
 *
 * Accepts CSV & JSON.
 *
 * @param {function} callback
 */
var step_parse = function(callback) {
	// json
	if (raw[0] === '[') {
		try {
			data = JSON.parse(raw);
		} catch (e) {
			return callback('Unable to parse JSON.');
		}
		return callback();
	}

	// csv
	data = [];
	csv(raw, {columns: true}, function(err, parsed) {
		parsed.forEach(function(line) {
			if (Array.isArray(line)) return;
			data.push(line);
		});
		callback();
	});
};

/**
 * Search!
 *
 * @param {function} callback
 */
var step_sift = function(callback) {
	var sifter = new Sifter(data);
	var sort = argv.sort && [{
		field: argv.sort,
		direction: argv.direction
	}];

	t_start = microtime.now();
	result = sifter.search(argv.query, {
		fields : argv.fields.split(','),
		limit  : argv.limit,
		sort   : sort
	});

	t_end = microtime.now();
	callback();
};

/**
 * Format and display output to console.
 *
 * @param {function} callback
 */
var step_output = function(callback) {
	var i, n, json;

	console.log('query = ' + JSON.stringify(result.query));
	console.log('fields = ' + result.options.fields.join(', '));
	console.log('total results = ' + humanize.numberFormat(result.total, 0));
	console.log('total searched = ' + humanize.numberFormat(data.length, 0));
	console.log('search time = ' + humanize.numberFormat((t_end - t_start) / 1000) + 'ms');
	console.log('');

	for (i = 0, n = result.items.length; i < n; i++) {
		process.stdout.write('\033[1;30m' + result.items[i].score.toFixed(5) + '\033[0;39m ');
		console.log(highlight(data[result.items[i].id]));
	}

	callback();
};

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

async.series([
	step_read,
	step_parse,
	step_sift,
	step_output
], function(err) {
	if (err) console.error(err);
	process.exit(err ? 1 : 0);
});
