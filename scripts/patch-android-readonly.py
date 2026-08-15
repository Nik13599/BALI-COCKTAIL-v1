#!/usr/bin/env python3
from pathlib import Path
import sys

path = Path(sys.argv[1])
text = path.read_text(encoding='utf-8')

start = text.index('@Composable\nprivate fun DetailScreen(')
end = text.index('\n@Composable\nprivate fun CocktailPhotoEditor', start)

replacement = '''@Composable
private fun DetailScreen(cocktail: Cocktail, onBack: () -> Unit) {
    Box(modifier = Modifier.fillMaxSize().background(Background)) {
        LazyColumn(
            modifier = Modifier.fillMaxSize().background(Background),
            contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 76.dp, bottom = 32.dp),
        ) {
            item {
                Text(cocktail.category.uppercase(Locale.getDefault()), fontSize = 11.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.5.sp, color = Color(0xFFD19AA8))
                Spacer(Modifier.height(6.dp))
                Text(cocktail.name, fontSize = 34.sp, lineHeight = 39.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
                Spacer(Modifier.height(8.dp))
                Text(cocktail.taste, fontSize = 16.sp, lineHeight = 23.sp, color = TextSecondary)
                Spacer(Modifier.height(20.dp))
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        SpecCard("МЕТОД", cocktail.method, Modifier.weight(1f))
                        SpecCard("БОКАЛ", cocktail.glass, Modifier.weight(1f))
                    }
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        SpecCard("ЛЁД", cocktail.ice, Modifier.weight(1f))
                        SpecCard("ВЫХОД", cocktail.yieldText, Modifier.weight(1f))
                    }
                }
                Spacer(Modifier.height(28.dp))
                SectionTitle("Ингредиенты")
                Spacer(Modifier.height(10.dp))
                Card(modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(20.dp), colors = CardDefaults.cardColors(containerColor = SurfaceDark)) {
                    cocktail.ingredients.forEachIndexed { index, ingredient ->
                        IngredientRow(ingredient)
                        if (index != cocktail.ingredients.lastIndex) HorizontalDivider(modifier = Modifier.padding(horizontal = 16.dp), color = Color(0xFF2D2C31))
                    }
                }
                Spacer(Modifier.height(28.dp))
                SectionTitle("Приготовление")
                Spacer(Modifier.height(12.dp))
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    cocktail.steps.forEachIndexed { index, step -> StepRow(index + 1, step) }
                }
                Spacer(Modifier.height(26.dp))
                Text("Техкарты и фотографии изменяются только через BALI COCKTAIL ADMIN. Мобильное приложение работает только в режиме просмотра.", fontSize = 12.sp, lineHeight = 18.sp, color = Color(0xFF706C70))
            }
        }

        Button(
            onClick = onBack,
            modifier = Modifier.align(Alignment.TopStart).statusBarsPadding().padding(start = 12.dp, top = 8.dp),
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xEE202025)),
            shape = RoundedCornerShape(14.dp),
            contentPadding = PaddingValues(horizontal = 13.dp, vertical = 10.dp),
            border = BorderStroke(1.dp, Color(0xFF3A383D)),
        ) {
            Text("‹ Все коктейли", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Color.White)
        }
    }
}
'''

text = text[:start] + replacement + text[end:]

photo_start = text.index('@Composable\nprivate fun CocktailPhotoEditor(')
photo_end = text.index('\n@Composable\nprivate fun SpecCard', photo_start)
text = text[:photo_start] + text[photo_end:]

path.write_text(text, encoding='utf-8')
print('Android read-only mode applied')
