var fs = require('fs');

var generate_searches = function(length, strict, limit) {
	var letters = 'abcdefghijklmnopqrstuvwxyz';
	var combinations = [];
	var branch = function(base, level) {
		if (level === length) return;
		for (var i = 0, n = letters.length; i < n; i++) {
			if (combinations.length === limit) {
				return;
			}
			if (!strict || level === length - 1) {
				combinations.push(base + letters[i]);
			}
			branch(base + letters[i], level + 1);
		}
	};
	branch('', 0);
	return combinations.join('\n');
};

process.chdir(__dirname);
fs.writeFileSync('searches_mixed.txt', generate_searches(3, false, 10000), 'utf8');
fs.writeFileSync('searches_1letter.txt', generate_searches(1, true, 10000), 'utf8');
fs.writeFileSync('searches_2letter.txt', generate_searches(2, true, 10000), 'utf8');
fs.writeFileSync('searches_3letter.txt', generate_searches(3, true, 10000), 'utf8');
fs.writeFileSync('searches_4letter.txt', generate_searches(4, true, 10000), 'utf8');
fs.writeFileSync('searches_5letter.txt', generate_searches(5, true, 10000), 'utf8');