import { Injectable, NgZone } from '@angular/core';
import { IpcRenderer, IpcRendererEvent } from 'electron';
import { Observable, ReplaySubject } from 'rxjs';

type EventCallback<T = any> = (event: IpcRendererEvent, ...args: T[]) => void;

@Injectable({
  providedIn: 'root'
})
export class IpcService {

  private readonly _ipc: IpcRenderer | undefined = undefined;

  public get ready(): boolean {
    return this._ipc !== undefined;
  }

  constructor(private zone: NgZone) {
    // Only load ipc if we're running inside electron
    if (window.require) {
      this._ipc = window.require('electron').ipcRenderer;
      this._ipc.setMaxListeners(0);
      this.connectListeners();
    } else {
      console.warn('Electron\'s IPC was not loaded');
    }
  }

  private connectListeners(): void {
    this.on('error', (e, error: Error) => {
      console.error(error);
    });
  }

  public getData<T = unknown>(channel: string, ...args: any[]): Observable<T> {
    return this.zone.run(() => {
      const response$ = new ReplaySubject<T>();
      this._ipc.on(`${channel}`, (e, data) => {
        this.zone.run(() => {
          response$.next(data);
        });
      });
      this._ipc.send(`${channel}:get`, ...args);
      return response$;
    });
  }

  /**
   * Gets data outside of ng zone, faster but not safe for change detector iterations
   * @param channel
   * @param args
   */
  public getDataFast<T = unknown>(channel: string, ...args: any[]): Observable<T> {
    const response$ = new ReplaySubject<T>();
    this._ipc.on(`${channel}`, (e, data) => {
      response$.next(data);
    });
    this._ipc.send(`${channel}:get`, ...args);
    return response$;
  }

  public on<T>(channel: string, cb: EventCallback<T>): void {
    if (this.ready) {
      this._ipc.on(channel, (event, ...args) => {
        this.zone.run(() => {
          cb(event, ...args);
        });
      });
    }
  }

  public once<T>(channel: string, cb: EventCallback<T>): void {
    if (this.ready) {
      this._ipc.once(channel, (event, ...args) => {
        this.zone.run(() => {
          cb(event, ...args);
        });
      });
    }
  }

  public send(channel: string, data?: any): void {
    if (this.ready) {
      this.zone.run(() => {
        return this._ipc.send(channel, data);
      });
    }
  }
}
