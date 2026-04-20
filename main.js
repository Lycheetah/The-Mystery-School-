const { app, BrowserWindow, shell, ipcMain, globalShortcut, nativeImage } = require('electron')
const path = require('path')
const Store = require('electron-store')
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

const store = new Store()

// IPC handlers for renderer storage access
ipcMain.handle('store:get', (_, key) => store.get(key))
ipcMain.handle('store:set', (_, key, value) => { store.set(key, value); return true })
ipcMain.handle('store:delete', (_, key) => { store.delete(key); return true })
ipcMain.handle('store:clear', () => { store.clear(); return true })

// Window control IPC
ipcMain.handle('win:minimize', (event) => {
  BrowserWindow.fromWebContents(event.sender)?.minimize()
})
ipcMain.handle('win:maximize', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender)
  if (!win) return
  win.isMaximized() ? win.unmaximize() : win.maximize()
  return win.isMaximized()
})
ipcMain.handle('win:close', (event) => {
  BrowserWindow.fromWebContents(event.sender)?.close()
})

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#0A0A12',
    frame: false,
    titleBarStyle: 'hidden',
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  if (isDev) {
    win.loadURL('http://localhost:5173')
    // win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(__dirname, 'dist/index.html'))
  }

  // Open external links in browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })
}

app.whenReady().then(() => {
  createWindow()

  // Global shortcut: Ctrl+Shift+H → navigate to crisis support from anywhere
  globalShortcut.register('CommandOrControl+Shift+H', () => {
    const win = BrowserWindow.getFocusedWindow()
    if (win) win.webContents.send('navigate', 'threshold')
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
