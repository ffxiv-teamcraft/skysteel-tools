import { Store } from './store';
import { buildKoboldXIV } from '@kobold/xiv';
import { Excel, Row } from '@kobold/excel';
import { SaintService } from './saint.service';
import { IpcService } from './service/ipc.service';
import { app, BrowserWindow, BrowserWindowConstructorOptions } from 'electron';
import { join } from 'path';


function buildSheet(sheetName: string) {
  return class extends Row {
    static sheet = sheetName;
  };
}

const BASE_APP_PATH = join(__dirname, '../../skysteel-tools');

function createWindow() {

  //Prepare all the managers
  const store = new Store();
  const ipc = new IpcService(store);
  const saint = new SaintService(ipc, store);

  const opts: BrowserWindowConstructorOptions = {
    show: false,
    backgroundColor: '#eee',
    autoHideMenuBar: true,
    frame: true,
    icon: `file://${BASE_APP_PATH}/assets/app-icon.png`,
    title: 'FFXIV Teamcraft',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  };
  Object.assign(opts, store.get('win:bounds', {}));
  const win = new BrowserWindow(opts);

  win.loadURL(`file://${BASE_APP_PATH}/index.html`);

  win.on('app-command', (e, cmd) => {
    if (cmd === 'browser-backward' && win.webContents.canGoBack()) {
      win.webContents.goBack();
    }
    if (cmd === 'browser-forward' && win.webContents.canGoForward()) {
      win.webContents.goForward();
    }
  });

  // save window size and position
  win.on('close', (event) => {
    if (!(<any>app).isQuitting && store.get<boolean>('always-quit', true) === false) {
      event.preventDefault();
      win.hide();
      return false;
    }
    store.set('win:bounds', win.getBounds());
    store.set('win:fullscreen', win.isMaximized());
    store.set('win:alwaysOnTop', win.isAlwaysOnTop());
  });

  win.on('ready-to-show', () => {
    win.show();
  });
}

async function start() {
  const kobold = await buildKoboldXIV();
  const excel = new Excel({ kobold });
  //TODO

  app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });
}

start();
