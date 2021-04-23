import { ipcMain, IpcMainEvent, WebContents } from 'electron';
import { Store } from '../store';

export class IpcService {

  constructor(private store: Store) {
    ipcMain.setMaxListeners(0);
  }

  public on(event: string, callback: (event: IpcMainEvent, ...args: any[]) => void): void {
    ipcMain.on(event, (e, ...args) => this.tryCallback(e.sender, callback, e, ...args));
  }

  public once(event: string, callback: (event: IpcMainEvent, ...args: any[]) => void): void {
    ipcMain.once(event, (e, ...args) => this.tryCallback(e.sender, callback, e, ...args));
  }

  public sendError(target: WebContents, error: Error): void {
    target.send('error', error);
  }

  private tryCallback(target: WebContents, callback: (...args: any[]) => void, ...args: any[]): void {
    try {
      callback(...args);
    } catch (e) {
      this.sendError(target, e);
    }
  }

  public twoWayBinding<T = any>(event: string, storeFieldName: string, onWrite?: (value: T, event: IpcMainEvent) => void, defaultValue?: T): void {
    ipcMain.on(event, (e, value) => {
      this.store.set(storeFieldName, value);
      if (onWrite) {
        this.tryCallback(e.sender, onWrite, value, e);
      }
      e.sender.send(`${event}:value()`, value);
    });

    ipcMain.on(`${event}:get`, (e) => {
      e.sender.send(`${event}:value()`, this.store.get(storeFieldName, defaultValue));
    });
  }
}
