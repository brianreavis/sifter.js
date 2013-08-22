# sifter.js
[![NPM version](https://badge.fury.io/js/sifter.png)](http://badge.fury.io/js/sifter)
[![Build Status](https://travis-ci.org/brianreavis/sifter.js.png?branch=master)](https://travis-ci.org/brianreavis/sifter.js)

Sifter is a [CommonJS](http://www.commonjs.org/) library for textually searching arrays and hashes of objects by property (or multiple properties). It's designed specifically for autocomplete. The process is three-step: *score*, *filter*, *sort*.

* **Supports díåcritîçs.**<br>For example, if searching for "montana" and an item in the set has a value of "montaña", it will still be matched.
* **Smart sorting.**<br>Items are scored intelligently depending on where a match is found in the string (how close to the beginning) and what percentage of the string matches.

```sh
$ npm install sifter # node.js
$ bower install sifter # browser
```

## Usage

```js
var sifter = new Sifter([
	{title: 'Annapurna I', location: 'Nepal', continent: 'Asia'},
	{title: 'Annapurna II', location: 'Nepal', continent: 'Asia'},
	{title: 'Annapurna III', location: 'Nepal', continent: 'Asia'},
	{title: 'Eiger', location: 'Switzerland', continent: 'Europe'},
	{title: 'Everest', location: 'Nepal', continent: 'Asia'},
	{title: 'Gannett', location: 'Wyoming', continent: 'North America'},
	{title: 'Denali', location: 'Alaska', continent: 'North America'}
]);

var result = sifter.search('anna', {
	fields: ['title', 'location', 'continent'],
	sort: 'title',
	direction: 'desc',
	limit: 3
});
```

Seaching will provide back meta information and an "items" array that contains objects with the index (or key, if searching a hash) and a score that represents how good of a match the item was. Items that did not match will not be returned.

```
{"score": 0.2878787878787879, "id": 0},
{"score": 0.27777777777777773, "id": 1},
{"score": 0.2692307692307692, "id": 2}
```

The sorting options are only acknowledged when searching by an empty string. Otherwise, sorting will always be by best-match. The full result comes back in the format of:

```js
{
	"options": {
		"fields": ["title", "location", "continent"],
		"sort": "title",
		"direction": "desc",
		"limit": 3
	},
	"query": "anna",
	"tokens": [{
		"string": "anna",
		"regex": /[aÀÁÂÃÄÅàáâãäå][nÑñ][nÑñ][aÀÁÂÃÄÅàáâãäå]/
	}],
	"total": 3,
	"items": [
		{"score": 0.2878787878787879, "id": 0},
		{"score": 0.27777777777777773, "id": 1},
		{"score": 0.2692307692307692,"id": 2}
	]
}
```

## API

#### .search(query, options)

Performs a search for `query` with the provided `options`.

<table width="100%">
	<tr>
		<th align="left">Option</th>
		<th>Type</th>
		<th align="left">Description</th>
	</tr>
	<tr>
		<td valign="top">"fields"</td>
		<td valign="top">array</td>
		<td valign="top">An array of property names to be searched.</td>
	</tr>
	<tr>
		<td valign="top">"limit"</td>
		<td valign="top">integer</td>
		<td valign="top">The maximum number of results to return.</td>
	</tr>
	<tr>
		<td valign="top">"sort"</td>
		<td valign="top">string</td>
		<td valign="top">The name of the property to sort by if no query is given.</td>
	</tr>
	<tr>
		<td valign="top">"direction"</td>
		<td valign="top">string</td>
		<td valign="top">The order in which to sort results ("asc" or "desc").</td>
	</tr>
</table>

## Contributing

The following dependencies are required to build and test:

```sh
$ npm install -g mocha
$ npm install -g uglify-js
```

First build a copy with `make` then run the test suite with `make test`.

When issuing a pull request, please exclude "sifter.js" and "sifter.min.js" in the project root.

## License

Copyright &copy; 2013 [Brian Reavis](http://twitter.com/brianreavis) & [Contributors](https://github.com/brianreavis/sifter.js/graphs/contributors)

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at: http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.