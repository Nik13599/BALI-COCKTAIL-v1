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

    private static func versionURL(for path: String) -> URL? {
        fileURL(for: path)?.appendingPathExtension("version")
    }

    private static func storedVersion(for path: String) -> Int {
        guard let url = versionURL(for: path), let text = try? String(contentsOf: url, encoding: .utf8) else { return 0 }
        return Int(text.trimmingCharacters(in: .whitespacesAndNewlines)) ?? 0
    }

    static func image(path: String?) -> UIImage? {
        guard let path, !path.isEmpty, let file = fileURL(for: path), FileManager.default.fileExists(atPath: file.path) else { return nil }
        return UIImage(contentsOfFile: file.path)
    }

    static func load(path: String?, version: Int = 0) async -> UIImage? {
        guard let path, !path.isEmpty else { return nil }
        if let cached = image(path: path), version <= 0 || storedVersion(for: path) == version { return cached }
        do {
            let suffix = version > 0 ? "?v=\(version)&ts=\(Int(Date().timeIntervalSince1970 * 1000))" : "?ts=\(Int(Date().timeIntervalSince1970 * 1000))"
            guard let url = URL(string: baseURL + path + suffix) else { return image(path: path) }
            var request = URLRequest(url: url)
            request.cachePolicy = .reloadIgnoringLocalAndRemoteCacheData
            let (data, response) = try await URLSession.shared.data(for: request)
            if let http = response as? HTTPURLResponse, !(200...299).contains(http.statusCode) { return image(path: path) }
            guard let image = UIImage(data: data), let file = fileURL(for: path) else { return image(path: path) }
            try? data.write(to: file, options: .atomic)
            if version > 0, let vURL = versionURL(for: path) { try? String(version).write(to: vURL, atomically: true, encoding: .utf8) }
            return image
        } catch {
            return image(path: path)
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
