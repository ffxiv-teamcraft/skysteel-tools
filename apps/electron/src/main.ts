import { Store } from './store';
import { buildKoboldXIV } from '@kobold/xiv';
import { SaintService } from './service/saint.service';
import { IpcService } from './service/ipc.service';
import { app, BrowserWindow, BrowserWindowConstructorOptions } from 'electron';
import { join } from 'path';
import { Kobold } from '@kobold/core';
import { KoboldService } from './service/kobold.service';
import { CsvService } from './service/csv.service';

const BASE_APP_PATH = join(__dirname, '../../skysteel-tools');

function createWindow(kobold: Kobold) {

  //Prepare all the managers
  const store = new Store();
  const ipc = new IpcService(store);
  new SaintService(ipc, store);
  new KoboldService(ipc, kobold);
  new CsvService(ipc, store);


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
  app.whenReady().then(() => {
    createWindow(kobold);

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow(kobold);
      }
    });
  });
}

start();
