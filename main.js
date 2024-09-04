const { app, BrowserWindow } = require('electron');
const path = require('path');

async function createWindow() {
  const Store = (await import('electron-store')).default;
  const store = new Store();

  const defaultSize = { width: 1000, height: 700 };
  const savedBounds = store.get('windowBounds', defaultSize);

  const win = new BrowserWindow({
    width: savedBounds.width,
    height: savedBounds.height,
    title: "Memos",
    webPreferences: {
      nodeIntegration: false,
    },
    show: false,
  });

  let loadFailed = false;

  const failTimeout = setTimeout(() => {
    loadFailed = true;
    win.loadFile(path.join(__dirname, 'error.html'));
    win.show();
  }, 5000);

  win.loadURL('https://memo.grakovne.org');

  win.webContents.on('did-fail-load', () => {
    if (!loadFailed) {
      clearTimeout(failTimeout);
      win.loadFile(path.join(__dirname, 'error.html'));
      win.show();
    }
  });

  win.webContents.on('did-finish-load', () => {
    if (!loadFailed) {
      clearTimeout(failTimeout);
      win.webContents.insertCSS('body::-webkit-scrollbar { display: none; }');
      setTimeout(() => {
        win.show();
      }, 200);
    }
  });

  win.on('resize', () => {
    const { width, height } = win.getBounds();
    store.set('windowBounds', { width, height });
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
