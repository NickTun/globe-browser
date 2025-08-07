const { app, BaseWindow, WebContentsView, ipcMain, Menu, session } = require('electron/main');
const path = require('path');
const rootDir = path.resolve(__dirname, '..', '..');
const nativeImage = require('electron').nativeImage

const TAB_TOP_OFFSET = 70;

if (app.dock) {
  const image = nativeImage.createFromPath(path.join(rootDir, 'src', 'resources', 'icon.png'))
  app.dock.setIcon(image);
}

const Resize = (bounds, obj, offset) => {
  obj.setBounds({ x: 0, y: 0 + offset, width: bounds.width, height: bounds.height - offset })
}

const winStorage = [];

class Window {
  constructor() {
    this.id = winStorage.length;
    this.activeTab = 0;
    this.viewStorage = [];

    this.win = new BaseWindow({
        titleBarStyle: 'hiddenInset',
        ...(process.platform !== 'darwin' ? { titleBarOverlay: true } : {}),
        icon: path.join(rootDir, 'src', 'resources', 'icon.icns'),
    })

    this.view = new WebContentsView({
      webPreferences: {
        preload: path.join(rootDir, 'src', 'preload', 'preload.js')
      }
    })

    this.win.contentView.addChildView(this.view);
    this.view.webContents.loadURL(`file://${path.join(rootDir, 'src', 'renderer', 'index.html')}`);
    Resize(this.win.getBounds(), this.view, 0);
    this.view.webContents.openDevTools({mode: 'detach'});

    this.win.on('resize', () => {
      this.viewStorage.forEach((webView) => {
        Resize(this.win.getBounds(), webView, TAB_TOP_OFFSET);
      })
      Resize(this.win.getBounds(), this.view, 0);
    });

    this.view.webContents.on('did-finish-load', () => {
      this.view.webContents.send('aquire-id', this.id);
    })
  }

  refreshTabViews(prevActive, active) {
    if(this.viewStorage[prevActive]) this.viewStorage[prevActive].setVisible(false);
    this.viewStorage[active].setVisible(true);
  }

  addNewTab() {
    const webView = new WebContentsView();
    this.win.contentView.addChildView(webView);
    webView.webContents.addListener('context-menu', () => {
      drawMenu(webView);
    })
    Resize(this.win.getBounds(), webView, TAB_TOP_OFFSET);
    this.viewStorage.push(webView);

    return this.viewStorage.length - 1;
  }

  drawMenu(target) {
    const template = [
      {
        label: 'Reload',
        click: () => { target.webContents.reload(); }
      },
      {
        label: 'Inspect Element',
        click: () => { target.webContents.openDevTools(); }
      }
    ];
    const menu = Menu.buildFromTemplate(template);
    menu.popup();
  }

  loadViewURL(url, tab_id) {
    this.viewStorage[tab_id].webContents.loadURL(url);
  }

  selectTabView(tab_id) {
    this.refreshTabViews(this.activeTab, tab_id);
    this.activeTab = tab_id;
  }

  removeTabView(tab_id) {
    this.viewStorage[tab_id].webContents.destroy()
    if(tab_id < this.activeTab) this.activeTab -= 1;
    this.viewStorage.splice(tab_id, 1);
  }
}

app.whenReady().then(() => {
  winStorage.push(new Window);

  ipcMain.on('new-tab-view', (e, url, id) => {
    const urlString = url != "" ? url : `file://${path.join(rootDir, 'src', 'renderer', 'pages', 'new_tab', 'index.html')}`;
    winStorage[id].loadViewURL(urlString, winStorage[id].addNewTab());
  });

  ipcMain.on('load-url', (e, url, tab_id, id) => {
    winStorage[id].loadViewURL(url, tab_id);
  });

  ipcMain.on('select-tab-view', (e, tab_id, id) => {
    winStorage[id].selectTabView(tab_id)
  });

  ipcMain.on('remove-tab-view', (e, tab_id, id) => {
    winStorage[id].removeTabView(tab_id)
  });

  app.on('activate', () => {
    winStorage.push(new Window);
  })

  // session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
  //   details.requestHeaders['User-Agent'] = 'Globe/0.0';
  //   callback({ cancel: false, requestHeaders: details.requestHeaders });
  // });
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})