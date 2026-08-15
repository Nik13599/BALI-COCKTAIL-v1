import SwiftUI

struct DetailView: View {
    let cocktail: Cocktail
    let catalogIngredients: [CatalogIngredient]
    @Environment(\.dismiss) private var dismiss
    @State private var selectedIngredient: CatalogIngredient?

    var body: some View {
        ZStack(alignment: .topLeading) {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    officialPhoto

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
                                            Text("Нажмите, чтобы рассмотреть").font(.caption2).foregroundStyle(.white.opacity(0.35))
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

                    Text("Техкарты и фотографии изменяются только через BALI COCKTAIL ADMIN. Мобильное приложение работает только в режиме просмотра.")
                        .font(.footnote).foregroundStyle(.white.opacity(0.42)).padding(.top, 4)
                }
                .padding(.horizontal, 16)
                .padding(.top, 64)
                .padding(.bottom, 16)
            }

            Button { dismiss() } label: {
                Label("Все коктейли", systemImage: "chevron.left")
                    .font(.system(size: 13, weight: .bold))
                    .padding(.horizontal, 13)
                    .padding(.vertical, 10)
                    .background(.ultraThinMaterial)
                    .foregroundStyle(.white)
                    .clipShape(RoundedRectangle(cornerRadius: 14))
                    .overlay(RoundedRectangle(cornerRadius: 14).stroke(.white.opacity(0.14), lineWidth: 1))
                    .shadow(color: .black.opacity(0.28), radius: 14, y: 6)
            }
            .padding(.leading, 12)
            .padding(.top, 10)
            .zIndex(20)
        }
        .background(backgroundColor.ignoresSafeArea())
        .toolbar(.hidden, for: .navigationBar)
        .sheet(item: $selectedIngredient) { ingredient in
            IngredientDetailSheet(ingredient: ingredient)
        }
    }

    private func catalogIngredient(for ingredient: Ingredient) -> CatalogIngredient? {
        if let id = ingredient.ingredientId, let exact = catalogIngredients.first(where: { $0.id == id }) { return exact }
        return catalogIngredients.first { $0.name.caseInsensitiveCompare(ingredient.name) == .orderedSame }
    }

    private var officialPhoto: some View {
        Group {
            if let path = cocktail.officialImage, !path.isEmpty {
                VStack(spacing: 0) {
                    OfficialCatalogImage(path: path)
                        .frame(maxWidth: .infinity)
                        .frame(height: 280)
                        .clipped()
                    Text("ЭТАЛОН BALI")
                        .font(.caption2.bold()).tracking(1)
                        .foregroundStyle(.white.opacity(0.55))
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(.horizontal, 14).padding(.vertical, 9)
                        .background(Color.black.opacity(0.18))
                }
                .background(cardColor)
                .clipShape(RoundedRectangle(cornerRadius: 22))
                .overlay(RoundedRectangle(cornerRadius: 22).stroke(cardBorder, lineWidth: 1))
            } else {
                VStack(spacing: 8) {
                    Image(systemName: "wineglass").font(.system(size: 34)).foregroundStyle(Color(red: 203/255, green: 143/255, blue: 160/255))
                    Text("Эталонное фото не загружено").font(.headline)
                    Text("Фотография добавляется администратором через BALI COCKTAIL ADMIN.")
                        .font(.subheadline).foregroundStyle(secondaryText).multilineTextAlignment(.center)
                }
                .frame(maxWidth: .infinity).frame(height: 220).padding(.horizontal, 24)
                .background(cardColor)
                .clipShape(RoundedRectangle(cornerRadius: 22))
                .overlay(RoundedRectangle(cornerRadius: 22).stroke(cardBorder, lineWidth: 1))
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
