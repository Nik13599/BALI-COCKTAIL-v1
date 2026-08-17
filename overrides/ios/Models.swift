import Foundation
import SwiftUI
import Network

struct Ingredient: Codable, Identifiable, Hashable {
    let ingredientId: String?
    let name: String
    let amount: Double?
    let unit: String

    var id: String { ingredientId ?? name }

    var amountText: String {
        guard let amount else { return "—" }
        if amount.rounded() == amount { return String(Int(amount)) }
        return String(format: "%.1f", amount)
    }
}

struct Cocktail: Codable, Identifiable, Hashable {
    let id: String
    let name: String
    let category: String
    let yieldText: String
    let ingredients: [Ingredient]
    let glass: String
    let ice: String
    let method: String
    let taste: String
    let steps: [String]
    let officialImage: String?

    enum CodingKeys: String, CodingKey {
        case id, name, category, ingredients, glass, ice, method, taste, steps, officialImage
        case yieldText = "yield"
    }
}

struct CatalogIngredient: Codable, Identifiable, Hashable {
    let id: String
    let name: String
    let category: String?
    let description: String?
    let officialImage: String?
    let active: Bool?
}

private struct CatalogManifest: Codable {
    let schemaVersion: Int?
    let catalogVersion: Int
    let updatedAt: String?
    let cocktails: String
    let ingredients: String
    let mediaBase: String?
}

@MainActor
final class CocktailStore: ObservableObject {
    @Published var cocktails: [Cocktail] = []
    @Published var ingredients: [CatalogIngredient] = []
    @Published var syncStatus: String = "Загрузка каталога…"

    private let baseURL = "https://raw.githubusercontent.com/Nik13599/BALI-COCKTAIL-v1/main/"
    private let decoder = JSONDecoder()
    private let networkMonitor = NWPathMonitor()
    private let networkQueue = DispatchQueue(label: "by.bali.cocktails.network-monitor")
    private var syncInProgress = false

    init() {
        loadLocal()
        networkMonitor.pathUpdateHandler = { [weak self] path in
            guard path.status == .satisfied else { return }
            Task { @MainActor in self?.sync() }
        }
        networkMonitor.start(queue: networkQueue)
        sync()
    }

    func sync() {
        guard !syncInProgress else { return }
        syncInProgress = true
        syncStatus = cocktails.isEmpty ? "Загрузка каталога…" : "Проверка обновлений…"

        Task {
            defer { syncInProgress = false }
            do {
                let stamp = Int(Date().timeIntervalSince1970 * 1000)
                let manifestURL = URL(string: baseURL + "data/manifest.json?ts=\(stamp)")!
                var manifestRequest = URLRequest(url: manifestURL)
                manifestRequest.cachePolicy = .reloadIgnoringLocalAndRemoteCacheData
                let (manifestData, manifestResponse) = try await URLSession.shared.data(for: manifestRequest)
                if let http = manifestResponse as? HTTPURLResponse, !(200...299).contains(http.statusCode) { throw URLError(.badServerResponse) }
                let manifest = try decoder.decode(CatalogManifest.self, from: manifestData)

                // Всегда перечитываем маленькие JSON-каталоги при наличии интернета.
                // Это ремонтирует ситуацию, когда версия уже совпала, а устройство однажды получило старый JSON из кэша.
                async let cocktailData = download(path: manifest.cocktails, version: manifest.catalogVersion, stamp: stamp)
                async let ingredientData = download(path: manifest.ingredients, version: manifest.catalogVersion, stamp: stamp)
                let (newCocktailData, newIngredientData) = try await (cocktailData, ingredientData)

                let decodedCocktails = try decoder.decode([Cocktail].self, from: newCocktailData)
                let decodedIngredients = try decoder.decode([CatalogIngredient].self, from: newIngredientData)

                try save(newCocktailData, name: "cocktails.json")
                try save(newIngredientData, name: "ingredients.json")
                try save(manifestData, name: "manifest.json")
                UserDefaults.standard.set(manifest.catalogVersion, forKey: "bali.catalog.version")

                cocktails = decodedCocktails
                ingredients = decodedIngredients

                // Даже при той же версии повторяем загрузку отсутствующих медиа.
                // OfficialMediaStore не скачивает уже сохранённые файлы, поэтому офлайн-кэш остаётся экономным.
                let mediaPaths = Set(decodedCocktails.compactMap(\.officialImage) + decodedIngredients.compactMap(\.officialImage))
                await OfficialMediaStore.prefetch(paths: Array(mediaPaths), version: manifest.catalogVersion)

                syncStatus = "Каталог актуален · v\(manifest.catalogVersion)"
            } catch {
                syncStatus = cocktails.isEmpty ? "Не удалось загрузить каталог" : "Офлайн · сохранённый каталог"
            }
        }
    }

    private func download(path: String, version: Int, stamp: Int) async throws -> Data {
        let separator = path.contains("?") ? "&" : "?"
        let url = URL(string: baseURL + path + "\(separator)v=\(version)&ts=\(stamp)")!
        var request = URLRequest(url: url)
        request.cachePolicy = .reloadIgnoringLocalAndRemoteCacheData
        let (data, response) = try await URLSession.shared.data(for: request)
        if let http = response as? HTTPURLResponse, !(200...299).contains(http.statusCode) {
            throw URLError(.badServerResponse)
        }
        return data
    }

    private func catalogDirectory() throws -> URL {
        let base = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
        let dir = base.appendingPathComponent("BALI_COCKTAIL_Catalog", isDirectory: true)
        try FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        return dir
    }

    private func save(_ data: Data, name: String) throws {
        try data.write(to: catalogDirectory().appendingPathComponent(name), options: .atomic)
    }

    private func loadLocal() {
        do {
            let dir = try catalogDirectory()
            let cURL = dir.appendingPathComponent("cocktails.json")
            let iURL = dir.appendingPathComponent("ingredients.json")
            if FileManager.default.fileExists(atPath: cURL.path) {
                cocktails = try decoder.decode([Cocktail].self, from: Data(contentsOf: cURL))
                if FileManager.default.fileExists(atPath: iURL.path) {
                    ingredients = try decoder.decode([CatalogIngredient].self, from: Data(contentsOf: iURL))
                }
                syncStatus = "Сохранённый каталог · проверка обновлений…"
                return
            }
        } catch { }

        if let url = Bundle.main.url(forResource: "cocktails", withExtension: "json"),
           let data = try? Data(contentsOf: url),
           let decoded = try? decoder.decode([Cocktail].self, from: data) {
            cocktails = decoded
            syncStatus = "Встроенный каталог · проверка обновлений…"
        }
    }
}
