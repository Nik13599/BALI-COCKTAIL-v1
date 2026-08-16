import SwiftUI
import WebKit

struct ContentView: View {
    var body: some View {
        ZStack {
            Color(red: 11/255, green: 11/255, blue: 13/255).ignoresSafeArea()
            AdminWebView()
                .ignoresSafeArea(edges: .bottom)
        }
    }
}

struct AdminWebView: UIViewRepresentable {
    private let url = URL(string: "https://raw.githack.com/Nik13599/BALI-COCKTAIL-v1/main/mobile-admin/index.html")!

    func makeCoordinator() -> Coordinator { Coordinator() }

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.websiteDataStore = .default()
        config.defaultWebpagePreferences.allowsContentJavaScript = true
        config.preferences.javaScriptCanOpenWindowsAutomatically = false

        let web = WKWebView(frame: .zero, configuration: config)
        web.navigationDelegate = context.coordinator
        web.uiDelegate = context.coordinator
        web.isOpaque = false
        web.backgroundColor = UIColor(red: 11/255, green: 11/255, blue: 13/255, alpha: 1)
        web.scrollView.backgroundColor = web.backgroundColor
        web.allowsBackForwardNavigationGestures = true
        web.allowsLinkPreview = false
        web.load(URLRequest(url: url, cachePolicy: .reloadRevalidatingCacheData, timeoutInterval: 30))
        return web
    }

    func updateUIView(_ webView: WKWebView, context: Context) { }

    final class Coordinator: NSObject, WKNavigationDelegate, WKUIDelegate {
        func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
            guard let url = navigationAction.request.url else { return decisionHandler(.cancel) }
            if url.host == "raw.githack.com" || url.host == "api.github.com" || url.host == "raw.githubusercontent.com" {
                decisionHandler(.allow)
            } else if navigationAction.navigationType == .linkActivated {
                UIApplication.shared.open(url)
                decisionHandler(.cancel)
            } else {
                decisionHandler(.allow)
            }
        }
    }
}
