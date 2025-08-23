import { app, ipcMain } from 'electron/main'
import Window from './classes/Window'
// import icon from '../../resources/icon.png?asset'

// if (app.dock) {
//   app.dock.setIcon(icon)
// }

const winStorage: Array<Window> = []
let draggedWindowStatus = -1

async function getDraggedWindowStatus(): Promise<number> {
  return draggedWindowStatus
}

app.whenReady().then(() => {
  winStorage.push(new Window(winStorage.length, null))

  ipcMain.on('new-tab-view', (_e, url, id) => {
    if (url != '') {
      winStorage[id].loadViewURL(url, winStorage[id].addNewTab())
    }
  })

  ipcMain.on('load-url', (_e, url, tab_id, id) => {
    winStorage[id].loadViewURL(url, tab_id)
  })

  ipcMain.on('select-tab-view', (_e, tab_id, id) => {
    winStorage[id].selectTabView(tab_id)
  })

  ipcMain.on('remove-tab-view', (_e, tab_id, id) => {
    winStorage[id].removeTabView(tab_id)
  })

  ipcMain.on('close-window', (_e, id) => {
    winStorage[id].closeWindow()
  })

  ipcMain.on('create-window', (_e, data) => {
    winStorage.push(new Window(winStorage.length, data))
  })

  ipcMain.on('exchange-views', (_e, tab_id, id_from, id_to) => {
    const tab = winStorage[id_from].getTab(tab_id)
    winStorage[id_to].pushTab(tab)
  })

  ipcMain.handle('get-dragged-window-status', getDraggedWindowStatus)

  ipcMain.on('set-dragged-window-status', (_e, id) => {
    draggedWindowStatus = id
  })

  app.on('activate', () => {
    winStorage.push(new Window(winStorage.length, null))
  })

  // session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
  //   details.requestHeaders['User-Agent'] = 'Globe/0.0'
  //   callback({ cancel: false, requestHeaders: details.requestHeaders })
  // })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

module.exports = { winStorage }