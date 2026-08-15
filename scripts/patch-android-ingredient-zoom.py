#!/usr/bin/env python3
from pathlib import Path
import sys

path=Path(sys.argv[1])
text=path.read_text(encoding='utf-8')
if 'import androidx.compose.ui.window.Dialog' not in text:
    text=text.replace('import androidx.compose.ui.unit.sp', 'import androidx.compose.ui.unit.sp\nimport androidx.compose.ui.window.Dialog')
start=text.index('@Composable\nprivate fun IngredientRow(')
end=text.index('\n@Composable\nprivate fun StepRow', start)
replacement='''@Composable
private fun IngredientRow(ingredient: Ingredient) {
    val context = LocalContext.current
    val bitmap = remember(ingredient.id) { loadIngredientPhoto(context, ingredient.id) }
    var showImage by remember(ingredient.id) { mutableStateOf(false) }
    Row(
        modifier = Modifier.fillMaxWidth().clickable(enabled = bitmap != null) { showImage = true }.padding(horizontal = 16.dp, vertical = 11.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        if (bitmap != null) {
            Image(bitmap = bitmap.asImageBitmap(), contentDescription = ingredient.name, modifier = Modifier.size(50.dp).clip(RoundedCornerShape(10.dp)), contentScale = ContentScale.Crop)
            Spacer(Modifier.width(12.dp))
        }
        Column(modifier = Modifier.weight(1f)) {
            Text(ingredient.name, fontSize = 15.sp, lineHeight = 20.sp, color = TextPrimary)
            if (bitmap != null) Text("Нажмите, чтобы увеличить фото", fontSize = 10.sp, color = Color(0xFF817C80))
        }
        Spacer(Modifier.width(14.dp))
        Text("${ingredient.amount} ${ingredient.unit}", fontSize = 15.sp, fontWeight = FontWeight.Bold, color = Color(0xFFE0C4CC))
    }
    if (showImage && bitmap != null) {
        Dialog(onDismissRequest = { showImage = false }) {
            Card(shape = RoundedCornerShape(22.dp), colors = CardDefaults.cardColors(containerColor = SurfaceDark), border = BorderStroke(1.dp, Color(0xFF343238))) {
                Column(modifier = Modifier.fillMaxWidth().padding(14.dp)) {
                    Image(bitmap = bitmap.asImageBitmap(), contentDescription = ingredient.name, modifier = Modifier.fillMaxWidth().height(460.dp), contentScale = ContentScale.Fit)
                    Spacer(Modifier.height(12.dp))
                    Text(ingredient.name, fontSize = 22.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
                    Text("Увеличенное фото ингредиента", fontSize = 12.sp, color = TextSecondary)
                    TextButton(onClick = { showImage = false }, modifier = Modifier.align(Alignment.End)) { Text("Закрыть") }
                }
            }
        }
    }
}
'''
text=text[:start]+replacement+text[end:]
path.write_text(text,encoding='utf-8')
print('Android ingredient zoom applied')