const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  showContextMenu: (id) => ipcRenderer.send('show-context-menu', id),
  newTabView: (url, id) => ipcRenderer.send('new-tab-view', url, id),
  selectTabView: (tab_id, id) => ipcRenderer.send('select-tab-view', tab_id, id),
  removeTabView: (tab_id, id) => ipcRenderer.send('remove-tab-view', tab_id, id),
  loadUrl: (url, tab_id, id) => ipcRenderer.send('load-url', url, tab_id, id),
  onAquireId: (callback) => ipcRenderer.on('aquire-id', (_event, id) => callback(id)),
  onAquireTabTitle: (callback) => ipcRenderer.on('aquire-tab-title', (_event, title) => callback(title)),
});