import UIKit

struct CocktailPhotoStore {
    private static func directory() -> URL? {
        guard let base = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first else { return nil }
        let dir = base.appendingPathComponent("CocktailPhotos", isDirectory: true)
        try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        return dir
    }

    private static func url(id: String) -> URL? {
        let safe = id.replacingOccurrences(of: "[^A-Za-z0-9._-]", with: "_", options: .regularExpression)
        return directory()?.appendingPathComponent("\(safe).jpg")
    }

    static func load(id: String) -> UIImage? {
        guard let url = url(id: id), let data = try? Data(contentsOf: url) else { return nil }
        return UIImage(data: data)
    }

    @discardableResult
    static func save(_ image: UIImage, id: String) -> Bool {
        guard let url = url(id: id), let data = image.jpegData(compressionQuality: 0.9) else { return false }
        do {
            try data.write(to: url, options: .atomic)
            return true
        } catch {
            return false
        }
    }

    static func delete(id: String) {
        guard let url = url(id: id) else { return }
        try? FileManager.default.removeItem(at: url)
    }
}

extension UIImage {
    func normalizedForStorage(maxDimension: CGFloat) -> UIImage {
        let longest = max(size.width, size.height)
        guard longest > maxDimension, longest > 0 else { return self }
        let scale = maxDimension / longest
        let newSize = CGSize(width: size.width * scale, height: size.height * scale)
        let renderer = UIGraphicsImageRenderer(size: newSize)
        return renderer.image { _ in self.draw(in: CGRect(origin: .zero, size: newSize)) }
    }
}
