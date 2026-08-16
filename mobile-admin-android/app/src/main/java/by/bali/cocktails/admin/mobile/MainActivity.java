package by.bali.cocktails.admin.mobile;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.Window;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import androidx.annotation.Nullable;
import androidx.webkit.WebViewAssetLoader;
import androidx.webkit.WebViewClientCompat;

public class MainActivity extends Activity {
    private static final int FILE_CHOOSER = 501;
    private WebView webView;
    private ValueCallback<Uri[]> fileCallback;

    @Override protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Window w=getWindow(); w.setStatusBarColor(0xFF08090B); w.setNavigationBarColor(0xFF08090B);
        webView=new WebView(this); setContentView(webView); WebView.setWebContentsDebuggingEnabled(false);
        WebSettings s=webView.getSettings(); s.setJavaScriptEnabled(true); s.setDomStorageEnabled(true); s.setDatabaseEnabled(true); s.setAllowFileAccess(false); s.setAllowContentAccess(true); s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW); s.setUserAgentString(s.getUserAgentString()+" BALI-COCKTAIL-ADMIN-Android/3.0");
        final WebViewAssetLoader loader=new WebViewAssetLoader.Builder().addPathHandler("/assets/",new WebViewAssetLoader.AssetsPathHandler(this)).build();
        webView.setWebViewClient(new WebViewClientCompat(){
            @Override public WebResourceResponse shouldInterceptRequest(WebView view,WebResourceRequest request){return loader.shouldInterceptRequest(request.getUrl());}
            @Override @SuppressWarnings("deprecation") public WebResourceResponse shouldInterceptRequest(WebView view,String url){return loader.shouldInterceptRequest(Uri.parse(url));}
            @Override public boolean shouldOverrideUrlLoading(WebView view,WebResourceRequest request){Uri uri=request.getUrl(); if("appassets.androidplatform.net".equals(uri.getHost()))return false; if("api.github.com".equals(uri.getHost())||"raw.githubusercontent.com".equals(uri.getHost()))return false; startActivity(new Intent(Intent.ACTION_VIEW,uri)); return true;}
        });
        webView.setWebChromeClient(new WebChromeClient(){@Override public boolean onShowFileChooser(WebView wv,ValueCallback<Uri[]> cb,FileChooserParams p){if(fileCallback!=null)fileCallback.onReceiveValue(null);fileCallback=cb;Intent i=new Intent(Intent.ACTION_OPEN_DOCUMENT);i.addCategory(Intent.CATEGORY_OPENABLE);i.setType("image/*");try{startActivityForResult(i,FILE_CHOOSER);return true;}catch(Exception e){fileCallback=null;return false;}}});
        webView.loadUrl("https://appassets.androidplatform.net/assets/mobile-admin/admin-v3.html");
    }
    @Override protected void onActivityResult(int requestCode,int resultCode,@Nullable Intent data){super.onActivityResult(requestCode,resultCode,data);if(requestCode!=FILE_CHOOSER||fileCallback==null)return;Uri[] result=null;if(resultCode==RESULT_OK&&data!=null&&data.getData()!=null)result=new Uri[]{data.getData()};fileCallback.onReceiveValue(result);fileCallback=null;}
    @Override public void onBackPressed(){if(webView!=null){webView.evaluateJavascript("document.getElementById('editorPage')&&!document.getElementById('editorPage').classList.contains('hidden')?(closeEditor(),'closed'):'open'",v->{if(!"\"closed\"".equals(v)){if(webView.canGoBack())webView.goBack();else super.onBackPressed();}});}else super.onBackPressed();}
    @Override protected void onDestroy(){if(webView!=null){webView.stopLoading();webView.destroy();}super.onDestroy();}
}
