#!/usr/bin/env python3
from pathlib import Path
import sys

path=Path(sys.argv[1])
text=path.read_text(encoding='utf-8')
start=text.index('struct IngredientDetailSheet: View {')
end=text.index('\nstruct StatChip: View {', start)
replacement=r'''struct IngredientDetailSheet: View {
    let ingredient: CatalogIngredient
    @Environment(\.dismiss) private var dismiss
    @State private var showFullImage = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 14) {
                    if let path = ingredient.officialImage, !path.isEmpty {
                        Button { showFullImage = true } label: {
                            ZStack(alignment: .bottomTrailing) {
                                OfficialCatalogImage(path: path, contentMode: .fit)
                                    .frame(maxWidth: .infinity).frame(minHeight: 240, maxHeight: 390)
                                    .background(cardColor).clipShape(RoundedRectangle(cornerRadius: 20))
                                Label("Увеличить", systemImage: "magnifyingglass.plus")
                                    .font(.caption.bold()).padding(.horizontal, 10).padding(.vertical, 7)
                                    .background(.black.opacity(0.72)).foregroundStyle(.white)
                                    .clipShape(Capsule()).padding(12)
                            }
                        }.buttonStyle(.plain)
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
        .fullScreenCover(isPresented: $showFullImage) {
            if let path = ingredient.officialImage, !path.isEmpty {
                ZoomableIngredientImage(path: path, title: ingredient.name, isPresented: $showFullImage)
            }
        }
    }
}

struct ZoomableIngredientImage: View {
    let path: String
    let title: String
    @Binding var isPresented: Bool
    @State private var scale: CGFloat = 1
    @State private var baseScale: CGFloat = 1

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()
            OfficialCatalogImage(path: path, contentMode: .fit)
                .scaleEffect(scale)
                .gesture(MagnificationGesture()
                    .onChanged { value in scale = min(max(baseScale * value, 1), 5) }
                    .onEnded { _ in baseScale = scale })
                .onTapGesture(count: 2) {
                    withAnimation(.easeInOut(duration: 0.2)) {
                        scale = scale > 1 ? 1 : 2.5
                        baseScale = scale
                    }
                }
                .padding(.horizontal, 8)
            VStack {
                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text(title).font(.headline).foregroundStyle(.white)
                        Text("Разведите пальцы или нажмите дважды для увеличения").font(.caption).foregroundStyle(.white.opacity(0.65))
                    }
                    Spacer()
                    Button { isPresented = false } label: {
                        Image(systemName: "xmark").font(.headline).frame(width: 42, height: 42).background(.white.opacity(0.14)).clipShape(Circle()).foregroundStyle(.white)
                    }
                }.padding(16)
                Spacer()
            }
        }
        .preferredColorScheme(.dark)
    }
}
'''
text=text[:start]+replacement+text[end:]
path.write_text(text,encoding='utf-8')
print('iOS ingredient zoom applied')