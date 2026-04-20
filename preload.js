const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('store', {
  get: (key) => ipcRenderer.invoke('store:get', key),
  set: (key, value) => ipcRenderer.invoke('store:set', key, value),
  delete: (key) => ipcRenderer.invoke('store:delete', key),
  clear: () => ipcRenderer.invoke('store:clear'),
})

contextBridge.exposeInMainWorld('appBridge', {
  onNavigate: (callback) => {
    ipcRenderer.on('navigate', (_, view) => callback(view))
  },
  minimize: () => ipcRenderer.invoke('win:minimize'),
  maximize: () => ipcRenderer.invoke('win:maximize'),
  close:    () => ipcRenderer.invoke('win:close'),
  platform: process.platform,
})
