#!/usr/bin/env python3
from pathlib import Path
import sys

path = Path(sys.argv[1])
text = path.read_text(encoding='utf-8')

anchor = '''    private let categories = ["Все", "Авторские", "Классика", "Заготовки"]

    var filteredCocktails: [Cocktail] {
'''
insert = '''    private let categories = ["Все", "Авторские", "Классика", "Заготовки"]

    private var categoryOrder: [String] {
        let preferred = ["Авторские", "Классика", "Заготовки"]
        let existing = Set(store.cocktails.map { $0.category })
        let preferredExisting = preferred.filter { existing.contains($0) }
        let other = existing.filter { !preferred.contains($0) }.sorted {
            $0.compare($1, options: [.caseInsensitive, .diacriticInsensitive], range: nil, locale: Locale(identifier: "ru_RU")) == .orderedAscending
        }
        return preferredExisting + other
    }

    var filteredCocktails: [Cocktail] {
'''
if anchor not in text:
    raise SystemExit('iOS category anchor not found')
text = text.replace(anchor, insert, 1)

old = '''                    ScrollView {
                        LazyVStack(spacing: 10) {
                            ForEach(filteredCocktails) { cocktail in
                                NavigationLink(value: cocktail) { CocktailRow(cocktail: cocktail) }.buttonStyle(.plain)
                            }
                        }
                        .padding(.horizontal, 16).padding(.bottom, 24)
                    }
'''
new = '''                    ScrollView {
                        LazyVStack(alignment: .leading, spacing: 10) {
                            ForEach(selectedCategory == "Все" ? categoryOrder : [selectedCategory], id: \\.self) { category in
                                let group = filteredCocktails.filter { $0.category == category }
                                if !group.isEmpty {
                                    Text(category.uppercased())
                                        .font(.system(size: 12, weight: .bold))
                                        .tracking(1.2)
                                        .foregroundStyle(Color(red: 203/255, green: 143/255, blue: 160/255))
                                        .padding(.top, 10)
                                        .padding(.bottom, 2)
                                    ForEach(group) { cocktail in
                                        NavigationLink(value: cocktail) { CocktailRow(cocktail: cocktail) }.buttonStyle(.plain)
                                    }
                                }
                            }
                        }
                        .padding(.horizontal, 16).padding(.bottom, 24)
                    }
'''
if old not in text:
    raise SystemExit('iOS cocktail list block not found')
text = text.replace(old, new, 1)

path.write_text(text, encoding='utf-8')
print(f'Patched iOS category grouping: {path}')
