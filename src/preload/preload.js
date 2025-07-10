const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  showContextMenu: () => ipcRenderer.send('show-context-menu'),
  newTabView: () => ipcRenderer.send('new-tab-view'),
});