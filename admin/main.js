const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const fs = require('fs');
function createWindow(){
  const win=new BrowserWindow({width:1540,height:960,minWidth:1080,minHeight:720,backgroundColor:'#0b0b0d',title:'BALI COCKTAIL ADMIN',icon:path.join(__dirname,'icon.ico'),autoHideMenuBar:true,webPreferences:{contextIsolation:true,nodeIntegration:false,sandbox:true}});
  win.loadFile('index.html');
  win.webContents.on('did-finish-load',async()=>{for(const name of ['v13-core.js','products.js','print-tools.js','print-bartender-tweaks.js','publish-fix.js','offline-cache.js','bartender-photo-sync.js','print-media-fix.js','reload-verify.js']){try{const code=fs.readFileSync(path.join(__dirname,name),'utf8');await win.webContents.executeJavaScript(code)}catch(e){console.error(name,e)}}});
  win.webContents.setWindowOpenHandler(({url})=>{shell.openExternal(url);return{action:'deny'}});
}
app.whenReady().then(()=>{createWindow();app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0)createWindow()})});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit()});
