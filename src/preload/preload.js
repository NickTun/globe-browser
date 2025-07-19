const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  showContextMenu: () => ipcRenderer.send('show-context-menu'),
  newTabView: () => ipcRenderer.send('new-tab-view'),
  selectTabView: (data) => ipcRenderer.send('select-tab-view', data),
  removeTabView: (data) => ipcRenderer.send('remove-tab-view', data),
});