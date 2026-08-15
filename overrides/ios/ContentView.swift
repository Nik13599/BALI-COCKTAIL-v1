import SwiftUI

let backgroundColor = Color(red: 11/255, green: 11/255, blue: 13/255)
let cardColor = Color(red: 21/255, green: 21/255, blue: 25/255)
let cardBorder = Color(red: 44/255, green: 43/255, blue: 48/255)
let accentColorBali = Color(red: 142/255, green: 41/255, blue: 72/255)
let secondaryText = Color(red: 185/255, green: 180/255, blue: 182/255)

struct ContentView: View {
    @StateObject private var store = CocktailStore()
    @State private var searchText = ""
    @State private var selectedCategory = "Все"
    private let categories = ["Все", "Авторские", "Классика", "Заготовки"]

    var filteredCocktails: [Cocktail] {
        store.cocktails.filter { cocktail in
            let categoryMatch = selectedCategory == "Все" || cocktail.category == selectedCategory
            let query = searchText.trimmingCharacters(in: .whitespacesAndNewlines)
            let ingredientMatch = cocktail.ingredients.contains { $0.name.localizedCaseInsensitiveContains(query) }
            let searchMatch = query.isEmpty || cocktail.name.localizedCaseInsensitiveContains(query) || cocktail.taste.localizedCaseInsensitiveContains(query) || ingredientMatch
            return categoryMatch && searchMatch
        }
    }

    var body: some View {
        NavigationStack {
            ZStack {
                backgroundColor.ignoresSafeArea()
                VStack(spacing: 12) {
                    VStack(alignment: .leading, spacing: 10) {
                        Text("BALI COCKTAIL").font(.system(size: 28, weight: .bold))
                        Text("\(store.cocktails.count) техкарт · фото хранятся только на этом устройстве")
                            .font(.subheadline).foregroundStyle(secondaryText)
                        TextField("Поиск коктейля или ингредиента", text: $searchText)
                            .textFieldStyle(.plain).padding(12).background(cardColor)
                            .overlay(RoundedRectangle(cornerRadius: 14).stroke(cardBorder, lineWidth: 1))
                            .clipShape(RoundedRectangle(cornerRadius: 14))
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 8) {
                                ForEach(categories, id: \.self) { category in
                                    Button(action: { selectedCategory = category }) {
                                        Text(category).font(.subheadline.weight(.semibold))
                                            .padding(.horizontal, 14).padding(.vertical, 8)
                                            .background(selectedCategory == category ? accentColorBali : cardColor)
                                            .foregroundStyle(.white).clipShape(Capsule())
                                            .overlay(Capsule().stroke(cardBorder, lineWidth: selectedCategory == category ? 0 : 1))
                                    }
                                }
                            }
                        }
                    }
                    .padding(.horizontal, 16).padding(.top, 8)

                    ScrollView {
                        LazyVStack(spacing: 10) {
                            ForEach(filteredCocktails) { cocktail in
                                NavigationLink(value: cocktail) { CocktailRow(cocktail: cocktail) }.buttonStyle(.plain)
                            }
                        }
                        .padding(.horizontal, 16).padding(.bottom, 24)
                    }
                }
            }
            .navigationDestination(for: Cocktail.self) { cocktail in DetailView(cocktail: cocktail) }
            .navigationBarHidden(true)
        }
    }
}

struct CocktailRow: View {
    let cocktail: Cocktail
    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack(alignment: .top) {
                Text(cocktail.name).font(.system(size: 20, weight: .bold)).multilineTextAlignment(.leading)
                Spacer()
                Text("›").font(.system(size: 26, weight: .medium)).foregroundStyle(.white.opacity(0.7))
            }
            Text(cocktail.category.uppercased()).font(.system(size: 11, weight: .bold)).foregroundStyle(Color(red: 203/255, green: 143/255, blue: 160/255))
            Text(cocktail.taste).font(.system(size: 13)).foregroundStyle(secondaryText).lineLimit(2)
            Text("\(cocktail.method)  ·  \(cocktail.yieldText)").font(.system(size: 12)).foregroundStyle(.white.opacity(0.55))
        }
        .frame(maxWidth: .infinity, alignment: .leading).padding(14).background(cardColor)
        .clipShape(RoundedRectangle(cornerRadius: 18))
        .overlay(RoundedRectangle(cornerRadius: 18).stroke(cardBorder, lineWidth: 1))
    }
}
