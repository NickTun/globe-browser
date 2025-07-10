const { app, BrowserWindow, BaseWindow, WebContentsView, ipcMain, Menu } = require('electron/main');
const path = require('path');
const rootDir = path.resolve(__dirname, '..', '..');
const { ref } = require('process');
const nativeImage = require('electron').nativeImage

if (app.dock) {
  const image = nativeImage.createFromPath(path.join(rootDir, 'src', 'resources', 'icon.png'))
  console.log(path.join(rootDir, 'src', 'resources', 'icon.png'))
  app.dock.setIcon(image);
}

const Resize = (bounds, obj, offset) => {
  obj.setBounds({ x: 0, y: 0 + offset, width: bounds.width, height: bounds.height - offset })
}

const createWindow = () => {
    const tabTopOffset = 40;
    let activeTab = 0;
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

    const refreshTabViews = (prevActive, active) => {
      if (viewStorage.length > active) {
        viewStorage[prevActive].setVisible(false);
        viewStorage[active].setVisible(true);
      }
    }

    win.on('resize', () => {
      viewStorage.forEach((webView) => {
        Resize(win.getBounds(), webView, tabTopOffset);
      })
      Resize(win.getBounds(), view, 0);
    })

    ipcMain.on('show-context-menu', (event) => {
      const template = [
        {
          label: 'Reload',
          click: () => { event.sender.reload(); }
        },
        {
          label: 'Inspect Element',
          click: () => { event.sender.openDevTools(); }
        }
      ];
      const menu = Menu.buildFromTemplate(template);
      menu.popup({ window: BrowserWindow.fromWebContents(event.sender) });
    });

    ipcMain.on('new-tab-view', () => {
      const webView = new WebContentsView();

      win.contentView.addChildView(webView);
      webView.webContents.loadURL('https://google.com');
      Resize(win.getBounds(), webView, tabTopOffset);

      viewStorage.push(webView);
      refreshTabViews(activeTab, activeTab + 1);
      activeTab++;
    });
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})