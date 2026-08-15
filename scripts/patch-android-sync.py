#!/usr/bin/env python3
from pathlib import Path
import sys

path = Path(sys.argv[1])
text = path.read_text(encoding='utf-8')

text = text.replace('import org.json.JSONArray\nimport java.io.File\nimport java.util.Locale', 'import org.json.JSONArray\nimport org.json.JSONObject\nimport java.io.File\nimport java.net.URL\nimport java.util.Locale')

text = text.replace(
    'data class Ingredient(val name: String, val amount: String, val unit: String)',
    'data class Ingredient(val id: String?, val name: String, val amount: String, val unit: String)'
)

text = text.replace(
'''data class Cocktail(
    val id: String,
    val name: String,
    val category: String,
    val yieldText: String,
    val ingredients: List<Ingredient>,
    val glass: String,
    val ice: String,
    val method: String,
    val taste: String,
    val steps: List<String>,
)''',
'''data class Cocktail(
    val id: String,
    val name: String,
    val category: String,
    val yieldText: String,
    val ingredients: List<Ingredient>,
    val glass: String,
    val ice: String,
    val method: String,
    val taste: String,
    val steps: List<String>,
    val officialImage: String?,
)'''
)

text = text.replace(
'''class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { BaliCocktailsTheme { BaliCocktailsApp() } }
    }
}''',
'''class MainActivity : ComponentActivity() {
    @Volatile private var syncRunning = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { BaliCocktailsTheme { BaliCocktailsApp() } }
    }

    override fun onResume() {
        super.onResume()
        if (syncRunning) return
        syncRunning = true
        Thread {
            val changed = syncCatalog(this)
            syncRunning = false
            if (changed) runOnUiThread { recreate() }
        }.start()
    }
}'''
)

text = text.replace(
'''    var photoRevision by remember(cocktail.id) { mutableIntStateOf(0) }
    val photoBitmap = remember(cocktail.id, photoRevision) { loadPhoto(context, cocktail.id) }''',
'''    var photoRevision by remember(cocktail.id) { mutableIntStateOf(0) }
    val photoBitmap = remember(cocktail.id, photoRevision) { loadPhoto(context, cocktail.id) }
    val officialBitmap = remember(cocktail.id, cocktail.officialImage) { loadOfficialPhoto(context, cocktail.officialImage) }'''
)

text = text.replace(
'''                CocktailPhotoEditor(
                    cocktailName = cocktail.name,
                    bitmap = photoBitmap,
                    onCamera = { cameraLauncher.launch(null) },
                    onGallery = { galleryLauncher.launch("image/*") },
                    onDelete = { deletePhoto(context, cocktail.id); photoRevision++ },
                )''',
'''                CocktailPhotoEditor(
                    cocktailName = cocktail.name,
                    bitmap = photoBitmap ?: officialBitmap,
                    isLocal = photoBitmap != null,
                    onCamera = { cameraLauncher.launch(null) },
                    onGallery = { galleryLauncher.launch("image/*") },
                    onDelete = { deletePhoto(context, cocktail.id); photoRevision++ },
                )'''
)

text = text.replace(
'''                Text("Фото добавляет сам пользователь. Оно хранится только во внутренней памяти этого телефона и не отправляется на сервер.", fontSize = 12.sp, lineHeight = 18.sp, color = Color(0xFF706C70))''',
'''                Text("Эталонные техкарты и официальные фотографии обновляются из BALI COCKTAIL ADMIN. Личное фото бармена хранится только на этом телефоне и имеет приоритет над эталонным.", fontSize = 12.sp, lineHeight = 18.sp, color = Color(0xFF706C70))'''
)

start = text.index('@Composable\nprivate fun CocktailPhotoEditor(')
end = text.index('\n@Composable\nprivate fun SpecCard', start)
text = text[:start] + '''@Composable
private fun CocktailPhotoEditor(cocktailName: String, bitmap: Bitmap?, isLocal: Boolean, onCamera: () -> Unit, onGallery: () -> Unit, onDelete: () -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Card(modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(24.dp), colors = CardDefaults.cardColors(containerColor = SurfaceDark), border = BorderStroke(1.dp, Color(0xFF2C2B30))) {
            if (bitmap != null) {
                Column {
                    Image(bitmap = bitmap.asImageBitmap(), contentDescription = cocktailName, modifier = Modifier.fillMaxWidth().height(250.dp), contentScale = ContentScale.Crop)
                    Text(if (isLocal) "МОЁ ФОТО" else "ЭТАЛОН BALI", modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp), fontSize = 10.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.sp, color = if (isLocal) Color(0xFFD19AA8) else Color(0xFFB9B4B6))
                }
            } else {
                Box(modifier = Modifier.fillMaxWidth().height(210.dp).padding(20.dp), contentAlignment = Alignment.Center) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("＋", fontSize = 42.sp, color = Color(0xFFD19AA8))
                        Spacer(Modifier.height(8.dp))
                        Text("Фото коктейля не добавлено", fontWeight = FontWeight.Bold, fontSize = 17.sp, color = TextPrimary)
                        Spacer(Modifier.height(5.dp))
                        Text("Сфотографируйте готовую подачу или выберите фото из галереи.", fontSize = 13.sp, lineHeight = 18.sp, color = TextSecondary)
                    }
                }
            }
        }
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            Button(onClick = onCamera, modifier = Modifier.weight(1f), colors = ButtonDefaults.buttonColors(containerColor = BurgundyBright), shape = RoundedCornerShape(14.dp)) {
                Text(if (isLocal) "Новое фото" else "Сфотографировать")
            }
            OutlinedButton(onClick = onGallery, modifier = Modifier.weight(1f), shape = RoundedCornerShape(14.dp)) { Text("Из галереи") }
        }
        if (isLocal) {
            TextButton(onClick = onDelete, modifier = Modifier.align(Alignment.End)) { Text("Удалить моё фото", color = Color(0xFFD69AAA)) }
        }
    }
}
''' + text[end:]

start = text.index('@Composable\nprivate fun IngredientRow(')
end = text.index('\n@Composable\nprivate fun StepRow', start)
text = text[:start] + '''@Composable
private fun IngredientRow(ingredient: Ingredient) {
    val context = LocalContext.current
    val bitmap = remember(ingredient.id) { loadIngredientPhoto(context, ingredient.id) }
    Row(modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 11.dp), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
        if (bitmap != null) {
            Image(bitmap = bitmap.asImageBitmap(), contentDescription = ingredient.name, modifier = Modifier.size(46.dp).clip(RoundedCornerShape(10.dp)), contentScale = ContentScale.Crop)
            Spacer(Modifier.width(12.dp))
        }
        Column(modifier = Modifier.weight(1f)) {
            Text(ingredient.name, fontSize = 15.sp, lineHeight = 20.sp, color = TextPrimary)
            if (bitmap != null) Text("Фото ингредиента из BALI ADMIN", fontSize = 10.sp, color = Color(0xFF817C80))
        }
        Spacer(Modifier.width(14.dp))
        Text("${ingredient.amount} ${ingredient.unit}", fontSize = 15.sp, fontWeight = FontWeight.Bold, color = Color(0xFFE0C4CC))
    }
}
''' + text[end:]

marker = 'private fun loadCocktails(context: Context): List<Cocktail> {'
idx = text.index(marker)
text = text[:idx] + r'''private const val CATALOG_BASE = "https://raw.githubusercontent.com/Nik13599/BALI-COCKTAIL-v1/main/"

private fun catalogDir(context: Context): File = File(context.filesDir, "bali_catalog").also { if (!it.exists()) it.mkdirs() }
private fun mediaDir(context: Context): File = File(context.filesDir, "bali_media").also { if (!it.exists()) it.mkdirs() }
private fun mediaFile(context: Context, relativePath: String): File {
    val safe = relativePath.replace(Regex("[^A-Za-z0-9._-]"), "_")
    return File(mediaDir(context), safe)
}

private fun readCatalogText(context: Context): String {
    val cached = File(catalogDir(context), "cocktails.json")
    return if (cached.exists()) cached.readText(Charsets.UTF_8)
    else context.assets.open("cocktails.json").bufferedReader(Charsets.UTF_8).use { it.readText() }
}

private fun loadCocktails(context: Context): List<Cocktail> {
    val array = JSONArray(readCatalogText(context))
    return buildList {
        for (index in 0 until array.length()) {
            val item = array.getJSONObject(index)
            val ingredientArray = item.getJSONArray("ingredients")
            val ingredients = buildList {
                for (i in 0 until ingredientArray.length()) {
                    val ingredient = ingredientArray.getJSONObject(i)
                    val id = ingredient.optString("ingredientId").takeIf { it.isNotBlank() }
                    add(Ingredient(id, ingredient.getString("name"), ingredient.get("amount").toString(), ingredient.getString("unit")))
                }
            }
            val stepArray = item.getJSONArray("steps")
            val steps = buildList { for (i in 0 until stepArray.length()) add(stepArray.getString(i)) }
            add(
                Cocktail(
                    item.getString("id"),
                    item.getString("name"),
                    item.getString("category"),
                    item.getString("yield"),
                    ingredients,
                    item.getString("glass"),
                    item.getString("ice"),
                    item.getString("method"),
                    item.getString("taste"),
                    steps,
                    item.optString("officialImage").takeIf { it.isNotBlank() && it != "null" },
                )
            )
        }
    }
}

private fun loadOfficialPhoto(context: Context, relativePath: String?): Bitmap? {
    if (relativePath.isNullOrBlank()) return null
    val file = mediaFile(context, relativePath)
    if (!file.exists()) return null
    return runCatching { BitmapFactory.decodeFile(file.absolutePath) }.getOrNull()
}

private fun loadIngredientPhoto(context: Context, ingredientId: String?): Bitmap? {
    if (ingredientId.isNullOrBlank()) return null
    val ingredientFile = File(catalogDir(context), "ingredients.json")
    if (!ingredientFile.exists()) return null
    return runCatching {
        val array = JSONArray(ingredientFile.readText(Charsets.UTF_8))
        for (i in 0 until array.length()) {
            val item = array.getJSONObject(i)
            if (item.optString("id") == ingredientId) {
                val path = item.optString("officialImage").takeIf { it.isNotBlank() && it != "null" } ?: return@runCatching null
                return@runCatching loadOfficialPhoto(context, path)
            }
        }
        null
    }.getOrNull()
}

private fun downloadText(relativePath: String, version: Int): String {
    return URL(CATALOG_BASE + relativePath + "?v=" + version).readText(Charsets.UTF_8)
}

private fun downloadMedia(context: Context, relativePath: String, version: Int) {
    if (relativePath.isBlank()) return
    runCatching {
        val target = mediaFile(context, relativePath)
        URL(CATALOG_BASE + relativePath + "?v=" + version).openStream().use { input ->
            target.outputStream().use { output -> input.copyTo(output) }
        }
    }
}

private fun syncCatalog(context: Context): Boolean {
    return runCatching {
        val manifestText = URL(CATALOG_BASE + "data/manifest.json?ts=" + System.currentTimeMillis()).readText(Charsets.UTF_8)
        val manifest = JSONObject(manifestText)
        val remoteVersion = manifest.optInt("catalogVersion", 0)
        val prefs = context.getSharedPreferences("bali_catalog_sync", Context.MODE_PRIVATE)
        val localVersion = prefs.getInt("catalogVersion", 0)
        if (remoteVersion <= localVersion) return@runCatching false

        val cocktailPath = manifest.optString("cocktails", "data/cocktails.json")
        val ingredientPath = manifest.optString("ingredients", "data/ingredients.json")
        val cocktailsText = downloadText(cocktailPath, remoteVersion)
        val ingredientsText = downloadText(ingredientPath, remoteVersion)

        val dir = catalogDir(context)
        File(dir, "cocktails.json").writeText(cocktailsText, Charsets.UTF_8)
        File(dir, "ingredients.json").writeText(ingredientsText, Charsets.UTF_8)
        File(dir, "manifest.json").writeText(manifestText, Charsets.UTF_8)

        val cocktailArray = JSONArray(cocktailsText)
        for (i in 0 until cocktailArray.length()) {
            cocktailArray.getJSONObject(i).optString("officialImage").takeIf { it.isNotBlank() && it != "null" }?.let { downloadMedia(context, it, remoteVersion) }
        }
        val ingredientArray = JSONArray(ingredientsText)
        for (i in 0 until ingredientArray.length()) {
            ingredientArray.getJSONObject(i).optString("officialImage").takeIf { it.isNotBlank() && it != "null" }?.let { downloadMedia(context, it, remoteVersion) }
        }

        prefs.edit().putInt("catalogVersion", remoteVersion).apply()
        true
    }.getOrElse { false }
}
'''

path.write_text(text, encoding='utf-8')
print(f'Patched Android sync: {path}')
