import { contextBridge, ipcRenderer } from 'electron'
import WindowTabInfo from '../types/WindowTabInfo'

contextBridge.exposeInMainWorld('electronAPI', {
  showContextMenu: (id: number) => ipcRenderer.send('show-context-menu', id),
  newTabView: (url: string, id: number) => ipcRenderer.send('new-tab-view', url, id),
  selectTabView: (tab_id: number, id: number) => ipcRenderer.send('select-tab-view', tab_id, id),
  removeTabView: (tab_id: number, id: number) => ipcRenderer.send('remove-tab-view', tab_id, id),
  loadUrl: (url: string, tab_id: number, id: number) => ipcRenderer.send('load-url', url, tab_id, id),
  onAquireId: (callback: (id: number, data: WindowTabInfo) => void) => ipcRenderer.on('aquire-id', (_event, id, data) => callback(id, data)),
  onAquireTabTitle: (callback: (title: string, tab_id: number) => void) => ipcRenderer.on('aquire-tab-title', (_event, title, tab_id) => callback(title, tab_id)),
  closeWindow: (id: number) => ipcRenderer.send('close-window', id),
  createWindow: (data: WindowTabInfo) => ipcRenderer.send('create-window', data),
  getDraggedWindowStatus: () => ipcRenderer.invoke('get-dragged-window-status'),
  setDraggedWindowStatus: (id: number) => ipcRenderer.send('set-dragged-window-status', id),
  exchangeViews: (tab_id: number, id_from: number, id_to: number) => ipcRenderer.send('exchange-views', tab_id, id_from, id_to),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onWindowCleanup: (callback: () => void) => ipcRenderer.once('window-cleanup', (_event) => callback()),
  onUrlChange: (callback: (url: string, tab_id: number) => void) => ipcRenderer.on('url-change', (_event, url, tab_id) => callback(url, tab_id)),
})

