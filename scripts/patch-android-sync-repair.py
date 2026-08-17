#!/usr/bin/env python3
from pathlib import Path
import sys

path = Path(sys.argv[1])
text = path.read_text(encoding='utf-8')

# Network callback imports.
text = text.replace(
    'import android.os.Bundle\n',
    'import android.os.Bundle\nimport android.net.ConnectivityManager\nimport android.net.Network\nimport android.net.NetworkCapabilities\nimport android.net.NetworkRequest\n',
    1,
)

old_activity = '''class MainActivity : ComponentActivity() {
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
new_activity = '''class MainActivity : ComponentActivity() {
    @Volatile private var syncRunning = false
    private lateinit var connectivityManager: ConnectivityManager
    private val networkCallback = object : ConnectivityManager.NetworkCallback() {
        override fun onAvailable(network: Network) { syncNow() }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        connectivityManager = getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        val request = NetworkRequest.Builder().addCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET).build()
        runCatching { connectivityManager.registerNetworkCallback(request, networkCallback) }
        setContent { BaliCocktailsTheme { BaliCocktailsApp() } }
    }

    override fun onResume() {
        super.onResume()
        syncNow()
    }

    override fun onDestroy() {
        runCatching { connectivityManager.unregisterNetworkCallback(networkCallback) }
        super.onDestroy()
    }

    private fun syncNow() {
        if (syncRunning) return
        syncRunning = true
        Thread {
            val changed = syncCatalog(this)
            syncRunning = false
            if (changed) runOnUiThread { recreate() }
        }.start()
    }
}'''
if old_activity not in text:
    raise SystemExit('MainActivity sync block not found')
text = text.replace(old_activity, new_activity, 1)

# Replace syncCatalog by brace matching.
start = text.find('private fun syncCatalog(context: Context): Boolean {')
if start < 0:
    raise SystemExit('syncCatalog not found')
brace = text.find('{', start)
depth = 0
end = None
for i in range(brace, len(text)):
    if text[i] == '{':
        depth += 1
    elif text[i] == '}':
        depth -= 1
        if depth == 0:
            end = i + 1
            break
if end is None:
    raise SystemExit('syncCatalog end not found')

new_sync = r'''private fun downloadMediaRepair(context: Context, relativePath: String, version: Int): Boolean {
    if (relativePath.isBlank()) return false
    val target = mediaFile(context, relativePath)
    if (target.exists() && target.length() > 0L) return false
    return runCatching {
        val stamp = System.currentTimeMillis()
        val tmp = File(target.parentFile, target.name + ".tmp")
        URL(CATALOG_BASE + relativePath + "?v=" + version + "&ts=" + stamp).openStream().use { input ->
            tmp.outputStream().use { output -> input.copyTo(output) }
        }
        if (tmp.length() <= 0L) error("empty media file")
        if (target.exists()) target.delete()
        if (!tmp.renameTo(target)) {
            tmp.copyTo(target, overwrite = true)
            tmp.delete()
        }
        true
    }.getOrElse { false }
}

private fun syncCatalog(context: Context): Boolean {
    return runCatching {
        val stamp = System.currentTimeMillis()
        val manifestText = URL(CATALOG_BASE + "data/manifest.json?ts=" + stamp).readText(Charsets.UTF_8)
        val manifest = JSONObject(manifestText)
        val remoteVersion = manifest.optInt("catalogVersion", 0)
        val cocktailPath = manifest.optString("cocktails", "data/cocktails.json")
        val ingredientPath = manifest.optString("ingredients", "data/ingredients.json")

        // Всегда перечитываем маленькие JSON при наличии сети. Это ремонтирует кэш даже если версия уже совпала.
        val cocktailsText = URL(CATALOG_BASE + cocktailPath + "?v=" + remoteVersion + "&ts=" + stamp).readText(Charsets.UTF_8)
        val ingredientsText = URL(CATALOG_BASE + ingredientPath + "?v=" + remoteVersion + "&ts=" + stamp).readText(Charsets.UTF_8)
        val cocktailArray = JSONArray(cocktailsText)
        val ingredientArray = JSONArray(ingredientsText)

        val dir = catalogDir(context)
        val cocktailFile = File(dir, "cocktails.json")
        val ingredientFile = File(dir, "ingredients.json")
        val catalogChanged = !cocktailFile.exists() || cocktailFile.readText(Charsets.UTF_8) != cocktailsText ||
            !ingredientFile.exists() || ingredientFile.readText(Charsets.UTF_8) != ingredientsText

        if (catalogChanged) {
            cocktailFile.writeText(cocktailsText, Charsets.UTF_8)
            ingredientFile.writeText(ingredientsText, Charsets.UTF_8)
        }
        File(dir, "manifest.json").writeText(manifestText, Charsets.UTF_8)
        context.getSharedPreferences("bali_catalog_sync", Context.MODE_PRIVATE).edit().putInt("catalogVersion", remoteVersion).apply()

        // На каждом успешном подключении пытаемся докачать именно отсутствующие фото.
        // Поэтому единичный сбой сети больше не фиксирует пустую картинку навсегда.
        var mediaChanged = false
        for (i in 0 until cocktailArray.length()) {
            cocktailArray.getJSONObject(i).optString("officialImage").takeIf { it.isNotBlank() && it != "null" }?.let {
                if (downloadMediaRepair(context, it, remoteVersion)) mediaChanged = true
            }
        }
        for (i in 0 until ingredientArray.length()) {
            ingredientArray.getJSONObject(i).optString("officialImage").takeIf { it.isNotBlank() && it != "null" }?.let {
                if (downloadMediaRepair(context, it, remoteVersion)) mediaChanged = true
            }
        }
        catalogChanged || mediaChanged
    }.getOrElse { false }
}'''
text = text[:start] + new_sync + text[end:]
path.write_text(text, encoding='utf-8')
print('Android offline-first repair sync applied')
