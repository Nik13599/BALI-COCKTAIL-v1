import SwiftUI
import PhotosUI
import UIKit

struct DetailView: View {
    let cocktail: Cocktail
    let catalogIngredients: [CatalogIngredient]
    @State private var photo: UIImage?
    @State private var selectedPhotoItem: PhotosPickerItem?
    @State private var showCamera = false
    @State private var selectedIngredient: CatalogIngredient?

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                photoEditor

                VStack(alignment: .leading, spacing: 8) {
                    Text(cocktail.name).font(.system(size: 30, weight: .bold))
                    Text(cocktail.category.uppercased()).font(.system(size: 12, weight: .bold)).foregroundStyle(Color(red: 203/255, green: 143/255, blue: 160/255))
                    Text(cocktail.taste).font(.body).foregroundStyle(secondaryText)
                }

                HStack(spacing: 10) {
                    StatChip(title: "Выход", value: cocktail.yieldText)
                    StatChip(title: "Метод", value: cocktail.method)
                    StatChip(title: "Бокал", value: cocktail.glass)
                }
                InfoBlock(title: "Лёд", text: cocktail.ice)

                VStack(alignment: .leading, spacing: 10) {
                    Text("Ингредиенты").font(.title3.weight(.bold))
                    ForEach(cocktail.ingredients) { ingredient in
                        let catalogItem = catalogIngredient(for: ingredient)
                        Button {
                            if let catalogItem { selectedIngredient = catalogItem }
                        } label: {
                            HStack(spacing: 11) {
                                if let imagePath = catalogItem?.officialImage, !imagePath.isEmpty {
                                    OfficialCatalogImage(path: imagePath)
                                        .frame(width: 46, height: 46)
                                        .clipShape(RoundedRectangle(cornerRadius: 10))
                                } else {
                                    RoundedRectangle(cornerRadius: 10)
                                        .fill(Color.white.opacity(0.035))
                                        .frame(width: 46, height: 46)
                                        .overlay(Image(systemName: "shippingbox").foregroundStyle(.white.opacity(0.25)))
                                }
                                VStack(alignment: .leading, spacing: 3) {
                                    Text(ingredient.name).foregroundStyle(.white).multilineTextAlignment(.leading)
                                    if catalogItem?.officialImage != nil {
                                        Text("Фото ингредиента BALI").font(.caption2).foregroundStyle(.white.opacity(0.35))
                                    }
                                }
                                Spacer()
                                Text("\(ingredient.amountText) \(ingredient.unit)").foregroundStyle(secondaryText)
                                if catalogItem != nil { Image(systemName: "chevron.right").font(.caption).foregroundStyle(.white.opacity(0.25)) }
                            }
                            .font(.body)
                            .contentShape(Rectangle())
                        }
                        .buttonStyle(.plain)
                        Divider().overlay(.white.opacity(0.08))
                    }
                }
                .padding(14).background(cardColor).clipShape(RoundedRectangle(cornerRadius: 18))
                .overlay(RoundedRectangle(cornerRadius: 18).stroke(cardBorder, lineWidth: 1))

                VStack(alignment: .leading, spacing: 10) {
                    Text("Приготовление").font(.title3.weight(.bold))
                    ForEach(Array(cocktail.steps.enumerated()), id: \.offset) { index, step in
                        HStack(alignment: .top, spacing: 10) {
                            Text("\(index + 1)").font(.system(size: 12, weight: .bold)).foregroundStyle(.white)
                                .frame(width: 24, height: 24).background(accentColorBali).clipShape(Circle())
                            Text(step).font(.body).fixedSize(horizontal: false, vertical: true)
                            Spacer(minLength: 0)
                        }
                    }
                }
                .padding(14).background(cardColor).clipShape(RoundedRectangle(cornerRadius: 18))
                .overlay(RoundedRectangle(cornerRadius: 18).stroke(cardBorder, lineWidth: 1))

                Text("Техкарта и эталонные фотографии обновляются из BALI COCKTAIL ADMIN. Личное фото хранится только на этом iPhone и не отправляется на сервер.")
                    .font(.footnote).foregroundStyle(.white.opacity(0.42)).padding(.top, 4)
            }
            .padding(16)
        }
        .background(backgroundColor.ignoresSafeArea())
        .navigationTitle(cocktail.name)
        .navigationBarTitleDisplayMode(.inline)
        .onAppear { photo = CocktailPhotoStore.load(id: cocktail.id) }
        .onChange(of: selectedPhotoItem) { item in
            guard let item else { return }
            Task {
                if let data = try? await item.loadTransferable(type: Data.self), let image = UIImage(data: data) {
                    let normalized = image.normalizedForStorage(maxDimension: 2200)
                    if CocktailPhotoStore.save(normalized, id: cocktail.id) {
                        await MainActor.run { photo = normalized }
                    }
                }
            }
        }
        .sheet(isPresented: $showCamera) {
            CameraPicker { image in
                let normalized = image.normalizedForStorage(maxDimension: 2200)
                if CocktailPhotoStore.save(normalized, id: cocktail.id) { photo = normalized }
            }
            .ignoresSafeArea()
        }
        .sheet(item: $selectedIngredient) { ingredient in
            IngredientDetailSheet(ingredient: ingredient)
        }
    }

    private func catalogIngredient(for ingredient: Ingredient) -> CatalogIngredient? {
        if let id = ingredient.ingredientId, let exact = catalogIngredients.first(where: { $0.id == id }) { return exact }
        return catalogIngredients.first { $0.name.caseInsensitiveCompare(ingredient.name) == .orderedSame }
    }

    private var photoEditor: some View {
        VStack(spacing: 10) {
            VStack(spacing: 0) {
                Group {
                    if let photo {
                        Image(uiImage: photo).resizable().scaledToFill().frame(maxWidth: .infinity).frame(height: 280).clipped()
                    } else if let path = cocktail.officialImage, !path.isEmpty {
                        OfficialCatalogImage(path: path).frame(maxWidth: .infinity).frame(height: 280).clipped()
                    } else {
                        VStack(spacing: 8) {
                            Image(systemName: "camera.fill").font(.system(size: 34)).foregroundStyle(Color(red: 203/255, green: 143/255, blue: 160/255))
                            Text("Фото коктейля не добавлено").font(.headline)
                            Text("Администратор может загрузить эталонное фото, а вы можете добавить личное фото подачи.")
                                .font(.subheadline).foregroundStyle(secondaryText).multilineTextAlignment(.center)
                        }
                        .frame(maxWidth: .infinity).frame(height: 220).padding(.horizontal, 24)
                    }
                }
                if photo != nil {
                    Text("МОЁ ФОТО").font(.caption2.bold()).tracking(1).foregroundStyle(Color(red: 203/255, green: 143/255, blue: 160/255))
                        .frame(maxWidth: .infinity, alignment: .leading).padding(.horizontal, 14).padding(.vertical, 9).background(Color.black.opacity(0.18))
                } else if cocktail.officialImage != nil {
                    Text("ЭТАЛОН BALI").font(.caption2.bold()).tracking(1).foregroundStyle(.white.opacity(0.55))
                        .frame(maxWidth: .infinity, alignment: .leading).padding(.horizontal, 14).padding(.vertical, 9).background(Color.black.opacity(0.18))
                }
            }
            .background(cardColor).clipShape(RoundedRectangle(cornerRadius: 22))
            .overlay(RoundedRectangle(cornerRadius: 22).stroke(cardBorder, lineWidth: 1))

            HStack(spacing: 10) {
                Button { showCamera = true } label: {
                    Label(photo == nil ? "Сфотографировать" : "Новое фото", systemImage: "camera")
                        .font(.subheadline.weight(.semibold)).frame(maxWidth: .infinity).padding(.vertical, 12)
                        .background(accentColorBali).foregroundStyle(.white).clipShape(RoundedRectangle(cornerRadius: 14))
                }
                PhotosPicker(selection: $selectedPhotoItem, matching: .images) {
                    Label("Из галереи", systemImage: "photo").font(.subheadline.weight(.semibold))
                        .frame(maxWidth: .infinity).padding(.vertical, 12).background(cardColor).foregroundStyle(.white)
                        .clipShape(RoundedRectangle(cornerRadius: 14)).overlay(RoundedRectangle(cornerRadius: 14).stroke(cardBorder, lineWidth: 1))
                }
            }

            if photo != nil {
                Button(role: .destructive) {
                    CocktailPhotoStore.delete(id: cocktail.id)
                    photo = nil
                } label: { Text("Удалить моё фото").font(.subheadline.weight(.semibold)) }
                .frame(maxWidth: .infinity, alignment: .trailing)
            }
        }
    }
}

struct IngredientDetailSheet: View {
    let ingredient: CatalogIngredient
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 14) {
                    if let path = ingredient.officialImage, !path.isEmpty {
                        OfficialCatalogImage(path: path, contentMode: .fit)
                            .frame(maxWidth: .infinity).frame(minHeight: 240, maxHeight: 380)
                            .background(cardColor).clipShape(RoundedRectangle(cornerRadius: 20))
                    }
                    Text(ingredient.name).font(.system(size: 28, weight: .bold))
                    if let category = ingredient.category, !category.isEmpty {
                        Text(category.uppercased()).font(.caption.bold()).tracking(1).foregroundStyle(Color(red: 203/255, green: 143/255, blue: 160/255))
                    }
                    Text((ingredient.description?.isEmpty == false ? ingredient.description! : "Описание пока не добавлено администратором."))
                        .foregroundStyle(secondaryText).fixedSize(horizontal: false, vertical: true)
                }
                .padding(16)
            }
            .background(backgroundColor.ignoresSafeArea())
            .toolbar { ToolbarItem(placement: .topBarTrailing) { Button("Закрыть") { dismiss() } } }
        }
        .preferredColorScheme(.dark)
    }
}

struct StatChip: View {
    let title: String
    let value: String
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title.uppercased()).font(.system(size: 10, weight: .bold)).foregroundStyle(.white.opacity(0.55))
            Text(value).font(.subheadline.weight(.semibold)).lineLimit(2).minimumScaleFactor(0.8)
        }
        .frame(maxWidth: .infinity, alignment: .leading).padding(12).background(cardColor)
        .clipShape(RoundedRectangle(cornerRadius: 16)).overlay(RoundedRectangle(cornerRadius: 16).stroke(cardBorder, lineWidth: 1))
    }
}

struct InfoBlock: View {
    let title: String
    let text: String
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title).font(.title3.weight(.bold))
            Text(text).font(.body).foregroundStyle(secondaryText)
        }
        .frame(maxWidth: .infinity, alignment: .leading).padding(14).background(cardColor)
        .clipShape(RoundedRectangle(cornerRadius: 18)).overlay(RoundedRectangle(cornerRadius: 18).stroke(cardBorder, lineWidth: 1))
    }
}

struct CameraPicker: UIViewControllerRepresentable {
    let onImage: (UIImage) -> Void
    @Environment(\.dismiss) private var dismiss

    final class Coordinator: NSObject, UINavigationControllerDelegate, UIImagePickerControllerDelegate {
        let parent: CameraPicker
        init(parent: CameraPicker) { self.parent = parent }
        func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey : Any]) {
            if let image = info[.originalImage] as? UIImage { parent.onImage(image) }
            parent.dismiss()
        }
        func imagePickerControllerDidCancel(_ picker: UIImagePickerController) { parent.dismiss() }
    }

    func makeCoordinator() -> Coordinator { Coordinator(parent: self) }
    func makeUIViewController(context: Context) -> UIImagePickerController {
        let picker = UIImagePickerController()
        picker.delegate = context.coordinator
        picker.sourceType = UIImagePickerController.isSourceTypeAvailable(.camera) ? .camera : .photoLibrary
        picker.cameraCaptureMode = .photo
        return picker
    }
    func updateUIViewController(_ uiViewController: UIImagePickerController, context: Context) {}
}
