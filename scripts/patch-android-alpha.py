#!/usr/bin/env python3
from pathlib import Path
import sys

path = Path(sys.argv[1])
text = path.read_text(encoding='utf-8')

start = text.find('private fun loadCocktails(context: Context): List<Cocktail> {')
if start < 0:
    raise SystemExit('loadCocktails function not found')

needle = '\n    }\n}\n\nprivate fun loadOfficialPhoto'
pos = text.find(needle, start)
if pos < 0:
    raise SystemExit('loadCocktails end marker not found')

replacement = '''\n    }.sortedWith { a, b ->\n        java.text.Collator.getInstance(Locale.forLanguageTag("ru")).compare(a.name, b.name)\n    }\n}\n\nprivate fun loadOfficialPhoto'''
text = text[:pos] + replacement + text[pos + len(needle):]
path.write_text(text, encoding='utf-8')
print('Android alphabetical cocktail sorting applied')
