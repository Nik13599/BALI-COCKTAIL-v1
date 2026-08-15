import Foundation
import SwiftUI
import UIKit

final class OfficialMediaStore {
    static let baseURL = "https://raw.githubusercontent.com/Nik13599/BALI-COCKTAIL-v1/main/"

    private static func directory() -> URL? {
        guard let base = FileManager.default.urls(for: .cachesDirectory, in: .userDomainMask).first else { return nil }
        let dir = base.appendingPathComponent("BALI_COCKTAIL_OfficialMedia", isDirectory: true)
        try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        return dir
    }

    private static func fileURL(for path: String) -> URL? {
        guard let dir = directory() else { return nil }
        let safe = path.replacingOccurrences(of: "/", with: "__")
        return dir.appendingPathComponent(safe)
    }

    static func image(path: String?) -> UIImage? {
        guard let path, !path.isEmpty, let file = fileURL(for: path), FileManager.default.fileExists(atPath: file.path) else { return nil }
        return UIImage(contentsOfFile: file.path)
    }

    static func load(path: String?, version: Int = 0) async -> UIImage? {
        guard let path, !path.isEmpty else { return nil }
        if let cached = image(path: path) { return cached }
        do {
            let suffix = version > 0 ? "?v=\(version)" : ""
            guard let url = URL(string: baseURL + path + suffix) else { return nil }
            let (data, response) = try await URLSession.shared.data(from: url)
            if let http = response as? HTTPURLResponse, !(200...299).contains(http.statusCode) { return nil }
            guard let image = UIImage(data: data), let file = fileURL(for: path) else { return nil }
            try? data.write(to: file, options: .atomic)
            return image
        } catch {
            return nil
        }
    }

    static func prefetch(paths: [String], version: Int) async {
        await withTaskGroup(of: Void.self) { group in
            for path in paths {
                group.addTask { _ = await load(path: path, version: version) }
            }
        }
    }
}

struct OfficialCatalogImage: View {
    let path: String?
    var contentMode: ContentMode = .fill
    @State private var image: UIImage?

    var body: some View {
        Group {
            if let image {
                Image(uiImage: image).resizable().aspectRatio(contentMode: contentMode)
            } else {
                Color(red: 16/255, green: 16/255, blue: 20/255)
            }
        }
        .task(id: path) {
            image = OfficialMediaStore.image(path: path)
            if image == nil { image = await OfficialMediaStore.load(path: path) }
        }
    }
}
