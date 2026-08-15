import Foundation
import SwiftUI

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

final class CocktailStore: ObservableObject {
    @Published var cocktails: [Cocktail] = []
    @Published var ingredients: [CatalogIngredient] = []
    @Published var syncStatus: String = "Загрузка каталога…"

    private let baseURL = "https://raw.githubusercontent.com/Nik13599/BALI-COCKTAIL-v1/main/"
    private let decoder = JSONDecoder()

    init() {
        loadLocal()
        sync()
    }

    func sync() {
        Task {
            do {
                let manifestURL = URL(string: baseURL + "data/manifest.json?ts=\(Int(Date().timeIntervalSince1970))")!
                let (manifestData, _) = try await URLSession.shared.data(from: manifestURL)
                let manifest = try decoder.decode(CatalogManifest.self, from: manifestData)
                let localVersion = UserDefaults.standard.integer(forKey: "bali.catalog.version")

                guard manifest.catalogVersion > localVersion || cocktails.isEmpty else {
                    await MainActor.run { self.syncStatus = "Каталог актуален · v\(manifest.catalogVersion)" }
                    return
                }

                async let cocktailData = download(path: manifest.cocktails, version: manifest.catalogVersion)
                async let ingredientData = download(path: manifest.ingredients, version: manifest.catalogVersion)
                let (newCocktailData, newIngredientData) = try await (cocktailData, ingredientData)

                let decodedCocktails = try decoder.decode([Cocktail].self, from: newCocktailData)
                let decodedIngredients = try decoder.decode([CatalogIngredient].self, from: newIngredientData)

                try save(newCocktailData, name: "cocktails.json")
                try save(newIngredientData, name: "ingredients.json")
                try save(manifestData, name: "manifest.json")
                UserDefaults.standard.set(manifest.catalogVersion, forKey: "bali.catalog.version")

                let mediaPaths = Set(decodedCocktails.compactMap(\.officialImage) + decodedIngredients.compactMap(\.officialImage))
                await OfficialMediaStore.prefetch(paths: Array(mediaPaths), version: manifest.catalogVersion)

                await MainActor.run {
                    self.cocktails = decodedCocktails
                    self.ingredients = decodedIngredients
                    self.syncStatus = "Каталог обновлён · v\(manifest.catalogVersion)"
                }
            } catch {
                await MainActor.run {
                    self.syncStatus = self.cocktails.isEmpty ? "Не удалось загрузить каталог" : "Офлайн · сохранённый каталог"
                }
            }
        }
    }

    private func download(path: String, version: Int) async throws -> Data {
        let url = URL(string: baseURL + path + "?v=\(version)")!
        let (data, response) = try await URLSession.shared.data(from: url)
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
                syncStatus = "Сохранённый каталог"
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
