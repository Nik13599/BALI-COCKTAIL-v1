package by.bali.cocktails

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.json.JSONArray
import java.io.File
import java.util.Locale

data class Ingredient(val name: String, val amount: String, val unit: String)

data class Cocktail(
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
)

private val Background = Color(0xFF0B0B0D)
private val SurfaceDark = Color(0xFF151519)
private val Burgundy = Color(0xFF6A1E32)
private val BurgundyBright = Color(0xFF8E2948)
private val TextPrimary = Color(0xFFF6F3F4)
private val TextSecondary = Color(0xFFB9B4B6)

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { BaliCocktailsTheme { BaliCocktailsApp() } }
    }
}

@Composable
private fun BaliCocktailsTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = darkColorScheme(
            primary = BurgundyBright,
            secondary = Color(0xFFBE8C9A),
            background = Background,
            surface = SurfaceDark,
            onPrimary = Color.White,
            onBackground = TextPrimary,
            onSurface = TextPrimary,
        ),
        content = content,
    )
}

@Composable
private fun BaliCocktailsApp() {
    val context = LocalContext.current
    val cocktails = remember { loadCocktails(context) }
    var selectedId by rememberSaveable { mutableStateOf<String?>(null) }
    val selected = selectedId?.let { id -> cocktails.firstOrNull { it.id == id } }
    Surface(modifier = Modifier.fillMaxSize(), color = Background) {
        if (selected == null) {
            CatalogScreen(cocktails = cocktails, onOpenCocktail = { selectedId = it.id })
        } else {
            BackHandler { selectedId = null }
            DetailScreen(cocktail = selected, onBack = { selectedId = null })
        }
    }
}

@Composable
private fun CatalogScreen(cocktails: List<Cocktail>, onOpenCocktail: (Cocktail) -> Unit) {
    var query by rememberSaveable { mutableStateOf("") }
    var category by rememberSaveable { mutableStateOf("Все") }
    val categories = remember(cocktails) { listOf("Все") + cocktails.map { it.category }.distinct() }
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

    Column(modifier = Modifier.fillMaxSize().background(Background).statusBarsPadding()) {
        Column(modifier = Modifier.padding(horizontal = 18.dp)) {
            Spacer(Modifier.height(14.dp))
            Text("BALI COCKTAIL", fontSize = 13.sp, fontWeight = FontWeight.SemiBold, letterSpacing = 2.sp, color = Color(0xFFCE9DAA))
            Spacer(Modifier.height(5.dp))
            Text("Коктейли", fontSize = 34.sp, lineHeight = 38.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
            Text("${cocktails.size} техкарт · фото хранятся только на этом устройстве", fontSize = 13.sp, color = TextSecondary)
            Spacer(Modifier.height(18.dp))
            OutlinedTextField(
                value = query,
                onValueChange = { query = it },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                placeholder = { Text("Поиск по названию или ингредиенту", color = Color(0xFF777278)) },
                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
                keyboardActions = KeyboardActions(onSearch = {}),
                shape = RoundedCornerShape(18.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedContainerColor = SurfaceDark,
                    unfocusedContainerColor = SurfaceDark,
                    focusedBorderColor = BurgundyBright,
                    unfocusedBorderColor = Color(0xFF343238),
                    focusedTextColor = TextPrimary,
                    unfocusedTextColor = TextPrimary,
                    cursorColor = BurgundyBright,
                ),
            )
            Spacer(Modifier.height(12.dp))
        }
        LazyRow(contentPadding = PaddingValues(horizontal = 18.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            items(categories) { item ->
                FilterChip(
                    selected = category == item,
                    onClick = { category = item },
                    label = { Text(item) },
                    colors = FilterChipDefaults.filterChipColors(
                        containerColor = SurfaceDark,
                        labelColor = TextSecondary,
                        selectedContainerColor = Burgundy,
                        selectedLabelColor = Color.White,
                    ),
                )
            }
        }
        Spacer(Modifier.height(8.dp))
        if (filtered.isEmpty()) {
            Box(modifier = Modifier.fillMaxSize().padding(24.dp), contentAlignment = Alignment.Center) {
                Text("Ничего не найдено", color = TextSecondary, fontSize = 17.sp)
            }
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(start = 18.dp, end = 18.dp, top = 4.dp, bottom = 28.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp),
            ) {
                items(filtered, key = { it.id }) { cocktail ->
                    CocktailListCard(cocktail = cocktail, onClick = { onOpenCocktail(cocktail) })
                }
            }
        }
    }
}

@Composable
private fun CocktailListCard(cocktail: Cocktail, onClick: () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth().clickable(onClick = onClick),
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = SurfaceDark),
        border = BorderStroke(1.dp, Color(0xFF2C2B30)),
    ) {
        Column(modifier = Modifier.padding(horizontal = 16.dp, vertical = 14.dp)) {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.Top) {
                Text(
                    text = cocktail.name,
                    modifier = Modifier.weight(1f),
                    fontSize = 20.sp,
                    lineHeight = 24.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                )
                Spacer(Modifier.width(8.dp))
                Text("›", fontSize = 28.sp, color = Color(0xFFAFA9AC))
            }
            Spacer(Modifier.height(5.dp))
            Text(cocktail.category.uppercase(Locale.getDefault()), fontSize = 10.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.sp, color = Color(0xFFCB8FA0))
            Spacer(Modifier.height(5.dp))
            Text(cocktail.taste, fontSize = 13.sp, lineHeight = 18.sp, color = TextSecondary, maxLines = 2, overflow = TextOverflow.Ellipsis)
            Spacer(Modifier.height(7.dp))
            Text("${cocktail.method}  ·  ${cocktail.yieldText}", fontSize = 12.sp, color = Color(0xFF8E898C))
        }
    }
}

@Composable
private fun DetailScreen(cocktail: Cocktail, onBack: () -> Unit) {
    val context = LocalContext.current
    var photoRevision by remember(cocktail.id) { mutableIntStateOf(0) }
    val photoBitmap = remember(cocktail.id, photoRevision) { loadPhoto(context, cocktail.id) }
    val cameraLauncher = rememberLauncherForActivityResult(ActivityResultContracts.TakePicturePreview()) { bitmap: Bitmap? ->
        if (bitmap != null && savePhoto(context, cocktail.id, bitmap)) photoRevision++
    }
    val galleryLauncher = rememberLauncherForActivityResult(ActivityResultContracts.GetContent()) { uri ->
        if (uri != null && savePhotoFromUri(context, cocktail.id, uri)) photoRevision++
    }

    LazyColumn(
        modifier = Modifier.fillMaxSize().background(Background).statusBarsPadding().navigationBarsPadding(),
        contentPadding = PaddingValues(bottom = 32.dp),
    ) {
        item {
            Row(modifier = Modifier.fillMaxWidth().padding(horizontal = 12.dp, vertical = 8.dp), verticalAlignment = Alignment.CenterVertically) {
                Text("‹", modifier = Modifier.clip(RoundedCornerShape(14.dp)).clickable(onClick = onBack).padding(horizontal = 12.dp, vertical = 2.dp), fontSize = 40.sp, lineHeight = 40.sp, color = Color.White)
                Spacer(Modifier.width(2.dp))
                Text("Все коктейли", modifier = Modifier.clickable(onClick = onBack), fontSize = 15.sp, color = TextSecondary)
            }
        }
        item {
            Column(modifier = Modifier.padding(horizontal = 16.dp)) {
                CocktailPhotoEditor(
                    cocktailName = cocktail.name,
                    bitmap = photoBitmap,
                    onCamera = { cameraLauncher.launch(null) },
                    onGallery = { galleryLauncher.launch("image/*") },
                    onDelete = { deletePhoto(context, cocktail.id); photoRevision++ },
                )
                Spacer(Modifier.height(18.dp))
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
                Text("Фото добавляет сам пользователь. Оно хранится только во внутренней памяти этого телефона и не отправляется на сервер.", fontSize = 12.sp, lineHeight = 18.sp, color = Color(0xFF706C70))
            }
        }
    }
}

@Composable
private fun CocktailPhotoEditor(cocktailName: String, bitmap: Bitmap?, onCamera: () -> Unit, onGallery: () -> Unit, onDelete: () -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Card(modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(24.dp), colors = CardDefaults.cardColors(containerColor = SurfaceDark), border = BorderStroke(1.dp, Color(0xFF2C2B30))) {
            if (bitmap != null) {
                Image(bitmap = bitmap.asImageBitmap(), contentDescription = cocktailName, modifier = Modifier.fillMaxWidth().height(250.dp), contentScale = ContentScale.Crop)
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
                Text(if (bitmap == null) "Сфотографировать" else "Новое фото")
            }
            OutlinedButton(onClick = onGallery, modifier = Modifier.weight(1f), shape = RoundedCornerShape(14.dp)) { Text("Из галереи") }
        }
        if (bitmap != null) {
            TextButton(onClick = onDelete, modifier = Modifier.align(Alignment.End)) { Text("Удалить фото", color = Color(0xFFD69AAA)) }
        }
    }
}

@Composable
private fun SpecCard(label: String, value: String, modifier: Modifier = Modifier) {
    Card(modifier = modifier, shape = RoundedCornerShape(16.dp), colors = CardDefaults.cardColors(containerColor = SurfaceDark)) {
        Column(modifier = Modifier.padding(14.dp)) {
            Text(label, fontSize = 10.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.sp, color = Color(0xFFB8788B))
            Spacer(Modifier.height(5.dp))
            Text(value, fontSize = 14.sp, lineHeight = 19.sp, fontWeight = FontWeight.Medium, color = TextPrimary)
        }
    }
}

@Composable
private fun IngredientRow(ingredient: Ingredient) {
    Row(modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 13.dp), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
        Text(ingredient.name, modifier = Modifier.weight(1f), fontSize = 15.sp, lineHeight = 20.sp, color = TextPrimary)
        Spacer(Modifier.width(14.dp))
        Text("${ingredient.amount} ${ingredient.unit}", fontSize = 15.sp, fontWeight = FontWeight.Bold, color = Color(0xFFE0C4CC))
    }
}

@Composable
private fun StepRow(number: Int, text: String) {
    Row(modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(18.dp)).background(SurfaceDark).padding(14.dp), verticalAlignment = Alignment.Top) {
        Box(modifier = Modifier.size(32.dp).clip(RoundedCornerShape(10.dp)).background(Burgundy), contentAlignment = Alignment.Center) {
            Text(number.toString(), fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Color.White)
        }
        Spacer(Modifier.width(12.dp))
        Text(text, modifier = Modifier.weight(1f), fontSize = 15.sp, lineHeight = 21.sp, color = Color(0xFFEAE6E7))
    }
}

@Composable
private fun SectionTitle(text: String) { Text(text, fontSize = 23.sp, fontWeight = FontWeight.Bold, color = TextPrimary) }

private fun photoFile(context: Context, cocktailId: String): File {
    val dir = File(context.filesDir, "cocktail_photos")
    if (!dir.exists()) dir.mkdirs()
    val safe = cocktailId.replace(Regex("[^A-Za-z0-9._-]"), "_")
    return File(dir, "$safe.jpg")
}

private fun loadPhoto(context: Context, cocktailId: String): Bitmap? {
    val file = photoFile(context, cocktailId)
    if (!file.exists()) return null
    return runCatching { BitmapFactory.decodeFile(file.absolutePath) }.getOrNull()
}

private fun savePhoto(context: Context, cocktailId: String, bitmap: Bitmap): Boolean = runCatching {
    photoFile(context, cocktailId).outputStream().use { out -> bitmap.compress(Bitmap.CompressFormat.JPEG, 92, out) }
}.isSuccess

private fun savePhotoFromUri(context: Context, cocktailId: String, uri: android.net.Uri): Boolean = runCatching {
    val bitmap = context.contentResolver.openInputStream(uri)?.use { BitmapFactory.decodeStream(it) } ?: error("Не удалось открыть изображение")
    photoFile(context, cocktailId).outputStream().use { out -> bitmap.compress(Bitmap.CompressFormat.JPEG, 92, out) }
}.isSuccess

private fun deletePhoto(context: Context, cocktailId: String) { runCatching { photoFile(context, cocktailId).delete() } }

private fun loadCocktails(context: Context): List<Cocktail> {
    val raw = context.assets.open("cocktails.json").bufferedReader(Charsets.UTF_8).use { it.readText() }
    val array = JSONArray(raw)
    return buildList {
        for (index in 0 until array.length()) {
            val item = array.getJSONObject(index)
            val ingredientArray = item.getJSONArray("ingredients")
            val ingredients = buildList {
                for (i in 0 until ingredientArray.length()) {
                    val ingredient = ingredientArray.getJSONObject(i)
                    add(Ingredient(ingredient.getString("name"), ingredient.get("amount").toString(), ingredient.getString("unit")))
                }
            }
            val stepArray = item.getJSONArray("steps")
            val steps = buildList { for (i in 0 until stepArray.length()) add(stepArray.getString(i)) }
            add(Cocktail(item.getString("id"), item.getString("name"), item.getString("category"), item.getString("yield"), ingredients, item.getString("glass"), item.getString("ice"), item.getString("method"), item.getString("taste"), steps))
        }
    }
}
