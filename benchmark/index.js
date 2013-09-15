/**
 * sifter.js Benchmark
 * Copyright (c) 2013 Brian Reavis & contributors
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

process.chdir(__dirname);

var fs        = require('fs');
var humanize  = require('humanize');
var microtime = require('microtime');
var Sifter    = require('../lib/sifter');

var measure_time = function(fn) {
	var start, end;
	global.gc();
	start = microtime.now();
	fn();
	end = microtime.now();
	global.gc();
	return end - start;
};

var time_baseline = measure_time(function() {
	var i, x;
	for (i = 0; i < 10000000; i++) {
		x = Math.sin(i * Math.PI);
	}
});

// create corpus (search set)
var corpus = (function() {
	var lines, i, n, items;

	lines = fs.readFileSync('corpus.csv', 'utf8').split('\n');
	lines.shift();

	items = [];
	for (i = 0, n = Math.floor(lines.length / 5); i < n; i++) {
		items.push({
			a: lines[i*5],
			b: lines[i*5+1],
			c: lines[i*5+2],
			d: lines[i*5+3],
			e: lines[i*5+4],
			index: i
		});
	}

	return items;
})();

// run trials
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

var path_report      = 'report.json';
var searches_limit   = 128;
var searches_mixed   = fs.readFileSync('searches_mixed.txt', 'utf8').split('\n').slice(0, searches_limit);
var searches_1letter = fs.readFileSync('searches_1letter.txt', 'utf8').split('\n').slice(0, searches_limit);
var searches_2letter = fs.readFileSync('searches_2letter.txt', 'utf8').split('\n').slice(0, searches_limit);
var searches_3letter = fs.readFileSync('searches_3letter.txt', 'utf8').split('\n').slice(0, searches_limit);
var reports_old      = {};
var reports_new      = {};

try { reports_old = JSON.parse(fs.readFileSync(path_report, 'utf8')); } catch (e) {}

var timed_report = function(title, fn) {
	var t_new   = measure_time(fn);
	var t_old   = reports_old[title];
	var t_delta = t_new - t_old;
	var p_delta = Math.round(t_delta / t_old * 100, 1);

	reports_new[title] = t_new;
	process.stdout.write('\033[1;39m' + humanize.numberFormat(t_new / 1000) + ' ms\033[0;39m \033[1;30m(score: ' + (t_new / time_baseline).toFixed(6) + ')\033[0;39m ');
	if (t_old) {
		process.stdout.write('\t' + (Math.abs(p_delta) < 5 ? '\033[1;30m' : (t_delta > 0 ? '\033[31m' : '\033[32m')));
		process.stdout.write((t_delta > 0 ? '-' : '+') + Math.abs(p_delta) + '% (' + (t_delta > 0 ? '+' : '') + humanize.numberFormat(Math.round(t_delta / 1000), 0) + 'ms)');
		process.stdout.write('\033[0;39m');
	}
	process.stdout.write('\t' + title);
	process.stdout.write('\n');
};

var trial = function(title, searches, options) {
	timed_report(title, function() {
		var sifter = new Sifter(corpus);
		for (var i = 0, n = searches_limit; i < n; i++) {
			sifter.search(options.query || searches[i % searches.length], options.options);
		}
	});
};

console.log('sifter.js Benchmark');
console.log('\033[1;30m' + humanize.numberFormat(searches_limit, 0) + ' trials (searches)\033[0;39m');
console.log('\033[1;30m' + humanize.numberFormat(corpus.length, 0) + ' options (index size)\033[0;39m');
console.log('\n\033[32mResults:\033[0;39m');

trial('No query', searches_mixed, {query: '', options: {fields: ['a'], sort: [{field: 'a'}], direction: 'asc'}});

console.log('');
trial('1 field search', searches_mixed, {options: {fields: ['a'], sort: [{field: 'a'}], direction: 'asc'}});
trial('1 field search (1 letter)', searches_1letter, {options: {fields: ['a'], sort: [{field: 'a'}], direction: 'asc'}});
trial('1 field search (2 letter)', searches_2letter, {options: {fields: ['a'], sort: [{field: 'a'}], direction: 'asc'}});
trial('1 field search (3 letter)', searches_3letter, {options: {fields: ['a'], sort: [{field: 'a'}], direction: 'asc'}});
trial('1 field search (limit 100)', searches_mixed, {options: {fields: ['a'], sort: [{field: 'a'}], direction: 'asc', limit: 100}});

console.log('');
trial('2 field search', searches_mixed, {options: {fields: ['a','b'], sort: [{field: 'a'}], direction: 'asc'}});
trial('2 field search (1 letter)', searches_1letter, {options: {fields: ['a','b'], sort: [{field: 'a'}], direction: 'asc'}});
trial('2 field search (2 letter)', searches_2letter, {options: {fields: ['a','b'], sort: [{field: 'a'}], direction: 'asc'}});
trial('2 field search (3 letter)', searches_3letter, {options: {fields: ['a','b'], sort: [{field: 'a'}], direction: 'asc'}});
trial('2 field search (limit 100)', searches_mixed, {options: {fields: ['a','b'], sort: [{field: 'a'}], direction: 'asc', limit: 100}});

console.log('');
trial('3 field search', searches_mixed, {options: {fields: ['a','b','c'], sort: [{field: 'a'}], direction: 'asc'}});
trial('3 field search (1 letter)', searches_1letter, {options: {fields: ['a','b','c'], sort: [{field: 'a'}], direction: 'asc'}});
trial('3 field search (2 letter)', searches_2letter, {options: {fields: ['a','b','c'], sort: [{field: 'a'}], direction: 'asc'}});
trial('3 field search (3 letter)', searches_3letter, {options: {fields: ['a','b','c'], sort: [{field: 'a'}], direction: 'asc'}});
trial('3 field search (limit 100)', searches_mixed, {options: {fields: ['a','b','c'], sort: [{field: 'a'}], direction: 'asc', limit: 100}});

console.log('');
trial('4 field search', searches_mixed, {options: {fields: ['a','b','c','d'], sort: [{field: 'a'}], direction: 'asc'}});
trial('4 field search (limit 100)', searches_mixed, {options: {fields: ['a','b','c','d'], sort: [{field: 'a'}], direction: 'asc', limit: 100}});
trial('4 field search (1 letter)', searches_1letter, {options: {fields: ['a','b','c','d'], sort: [{field: 'a'}], direction: 'asc'}});
trial('4 field search (2 letter)', searches_2letter, {options: {fields: ['a','b','c','d'], sort: [{field: 'a'}], direction: 'asc'}});
trial('4 field search (3 letter)', searches_3letter, {options: {fields: ['a','b','c','d'], sort: [{field: 'a'}], direction: 'asc'}});

console.log('');
trial('5 field search', searches_mixed, {options: {fields: ['a','b','c','d','e'], sort: [{field: 'a'}], direction: 'asc'}});
trial('5 field search (1 letter)', searches_1letter, {options: {fields: ['a','b','c','d','e'], sort: [{field: 'a'}], direction: 'asc'}});
trial('5 field search (2 letter)', searches_2letter, {options: {fields: ['a','b','c','d','e'], sort: [{field: 'a'}], direction: 'asc'}});
trial('5 field search (3 letter)', searches_3letter, {options: {fields: ['a','b','c','d','e'], sort: [{field: 'a'}], direction: 'asc'}});
trial('5 field search (limit 100)', searches_mixed, {options: {fields: ['a','b','c','d','e'], sort: [{field: 'a'}], direction: 'asc', limit: 100}});

if (process.argv.indexOf('--no-save') === -1) {
	fs.writeFileSync(path_report, JSON.stringify(reports_new), 'utf8');
	console.log('\nReport written to ' + path_report);
}