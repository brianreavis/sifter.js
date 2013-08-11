#!/bin/bash
IFS='%'
out=sifter.js
out_min=sifter.min.js
banner="/*! sifter.js | https://github.com/brianreavis/sifter.js | Apache License (v2) */"

# generate minified version...
cp src/sifter.js sifter.js
uglifyjs --mangle -b beautify=false,ascii-only=true --output $out_min $out
echo "$banner" | cat - $out_min > temp && mv temp $out_min

unset IFS