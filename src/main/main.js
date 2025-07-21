const { app, BaseWindow, WebContentsView, ipcMain, Menu } = require('electron/main');
const path = require('path');
const rootDir = path.resolve(__dirname, '..', '..');
const { ref } = require('process');
const nativeImage = require('electron').nativeImage

if (app.dock) {
  const image = nativeImage.createFromPath(path.join(rootDir, 'src', 'resources', 'icon.png'))
  app.dock.setIcon(image);
}

const Resize = (bounds, obj, offset) => {
  obj.setBounds({ x: 0, y: 0 + offset, width: bounds.width, height: bounds.height - offset })
}

function createWindow() {
    const tabTopOffset = 70;
    let activeTab = -1;
    const viewStorage = [];

    const win = new BaseWindow({
        titleBarStyle: 'hiddenInset',
        ...(process.platform !== 'darwin' ? { titleBarOverlay: true } : {}),
        icon: path.join(rootDir, 'src', 'resources', 'icon.icns'),
    })

    const view = new WebContentsView({
      webPreferences: {
        preload: path.join(rootDir, 'src', 'preload', 'preload.js')
      }
    })

    win.contentView.addChildView(view);
    view.webContents.loadURL(`file://${path.join(rootDir, 'src', 'renderer', 'index.html')}`);
    Resize(win.getBounds(), view, 0);
    view.webContents.openDevTools({mode: 'detach'});

    function refreshTabViews(prevActive, active) {
      if(viewStorage[prevActive]) viewStorage[prevActive].setVisible(false);
      viewStorage[active].setVisible(true);
    }

    function addNewTab(url) {
      const webView = new WebContentsView();
      win.contentView.addChildView(webView);
      webView.webContents.loadURL(url);
      webView.webContents.addListener('context-menu', () => {
        drawMenu(webView);
      })
      Resize(win.getBounds(), webView, tabTopOffset);
      viewStorage.push(webView);

      return webView;
    }

    function drawMenu(target) {
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

    win.on('resize', () => {
      viewStorage.forEach((webView) => {
        Resize(win.getBounds(), webView, tabTopOffset);
      })
      Resize(win.getBounds(), view, 0);
    })

    // ipcMain.on('show-context-menu', (event) => {
    //   const template = [
    //     {
    //       label: 'Reload',
    //       click: () => { event.sender.reload(); }
    //     },
    //     {
    //       label: 'Inspect Element',
    //       click: () => { event.sender.openDevTools(); }
    //     }
    //   ];
    //   const menu = Menu.buildFromTemplate(template);
    //   menu.popup({ window: BrowserWindow.fromWebContents(event.sender) });
    // });

    ipcMain.on('new-tab-view', () => {
      addNewTab(`file://${path.join(rootDir, 'src', 'renderer', 'pages', 'new_tab', 'index.html')}`);
    });

    ipcMain.on('load-url', (e, url) => {
      viewStorage[activeTab].webContents.loadURL(url);
    });

    ipcMain.on('select-tab-view', (e, tab_id) => {
      refreshTabViews(activeTab, tab_id);
      activeTab = tab_id;
    });

    ipcMain.on('remove-tab-view', (e, tab_id) => {
      viewStorage[tab_id].webContents.destroy()
      if(tab_id < activeTab) activeTab -= 1;
      viewStorage.splice(tab_id, 1);
    });
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BaseWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})