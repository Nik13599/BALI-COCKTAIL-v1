#!/usr/bin/env python3
from pathlib import Path
import sys

path = Path(sys.argv[1])
text = path.read_text(encoding='utf-8')

old_categories = '''    val categories = remember(cocktails) { listOf("Все") + cocktails.map { it.category }.distinct() }
    val filtered = remember(cocktails, query, category) {
        val q = query.trim().lowercase(Locale.getDefault())
        cocktails.filter { cocktail ->
            (category == "Все" || cocktail.category == category) &&
                (q.isBlank() ||
                    cocktail.name.lowercase(Locale.getDefault()).contains(q) ||
                    cocktail.taste.lowercase(Locale.getDefault()).contains(q) ||
                    cocktail.method.lowercase(Locale.getDefault()).contains(q) ||
                    cocktail.ingredients.any { it.name.lowercase(Locale.getDefault()).contains(q) })
        }.sortedBy { it.name }
    }
'''
new_categories = '''    val categoryOrder = remember(cocktails) {
        val preferred = listOf("Авторские", "Классика", "Заготовки")
        val presentPreferred = preferred.filter { group -> cocktails.any { it.category == group } }
        val other = cocktails.map { it.category }.distinct().filter { it !in preferred }
            .sortedWith(compareBy(String.CASE_INSENSITIVE_ORDER) { it })
        presentPreferred + other
    }
    val categories = remember(cocktails) { listOf("Все") + categoryOrder }
    val filtered = remember(cocktails, query, category) {
        val q = query.trim().lowercase(Locale.getDefault())
        cocktails.filter { cocktail ->
            (category == "Все" || cocktail.category == category) &&
                (q.isBlank() ||
                    cocktail.name.lowercase(Locale.getDefault()).contains(q) ||
                    cocktail.taste.lowercase(Locale.getDefault()).contains(q) ||
                    cocktail.method.lowercase(Locale.getDefault()).contains(q) ||
                    cocktail.ingredients.any { it.name.lowercase(Locale.getDefault()).contains(q) })
        }.sortedWith(compareBy<Cocktail> {
            val i = categoryOrder.indexOf(it.category)
            if (i < 0) Int.MAX_VALUE else i
        }.thenBy(String.CASE_INSENSITIVE_ORDER) { it.name })
    }
'''
if old_categories not in text:
    raise SystemExit('Android category/filter block not found')
text = text.replace(old_categories, new_categories, 1)

old_list = '''            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(start = 18.dp, end = 18.dp, top = 4.dp, bottom = 28.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp),
            ) {
                items(filtered, key = { it.id }) { cocktail ->
                    CocktailListCard(cocktail = cocktail, onClick = { onOpenCocktail(cocktail) })
                }
            }
'''
new_list = '''            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(start = 18.dp, end = 18.dp, top = 4.dp, bottom = 28.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp),
            ) {
                val visibleGroups = if (category == "Все") categoryOrder else listOf(category)
                visibleGroups.forEach { group ->
                    val groupItems = filtered.filter { it.category == group }
                    if (groupItems.isNotEmpty()) {
                        item(key = "category-$group") {
                            Text(
                                group.uppercase(Locale.getDefault()),
                                modifier = Modifier.fillMaxWidth().padding(top = 10.dp, bottom = 2.dp),
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                letterSpacing = 1.3.sp,
                                color = Color(0xFFCB8FA0),
                            )
                        }
                        items(groupItems, key = { it.id }) { cocktail ->
                            CocktailListCard(cocktail = cocktail, onClick = { onOpenCocktail(cocktail) })
                        }
                    }
                }
            }
'''
if old_list not in text:
    raise SystemExit('Android LazyColumn list block not found')
text = text.replace(old_list, new_list, 1)

path.write_text(text, encoding='utf-8')
print(f'Patched Android category grouping: {path}')
