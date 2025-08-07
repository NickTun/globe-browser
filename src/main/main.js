const { app, ipcMain, session } = require('electron/main');
const { Window } = require('./classes/Window.js');
const path = require('path');
const rootDir = path.resolve(__dirname, '..', '..');
const nativeImage = require('electron').nativeImage

if (app.dock) {
  const image = nativeImage.createFromPath(path.join(rootDir, 'src', 'resources', 'icon.png'))
  app.dock.setIcon(image);
}

const winStorage = [];
let draggedWindowStatus = -1;

async function getDraggedWindowStatus() {
  return draggedWindowStatus;
}

app.whenReady().then(() => {
  winStorage.push(new Window(winStorage.length));

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

  ipcMain.on('close-window', (e, id) => {
    winStorage[id].closeWindow();
  });

  ipcMain.on('create-window', (e, data) => {
    winStorage.push(new Window(winStorage.length, data.url));
  });

  ipcMain.handle('get-dragged-window-status', getDraggedWindowStatus);

  ipcMain.on('set-dragged-window-status', (e, id) => {
    draggedWindowStatus = id;
  });

  app.on('activate', () => {
    winStorage.push(new Window(winStorage.length));
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

module.exports = { winStorage };