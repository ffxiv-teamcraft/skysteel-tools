import { Injectable, NgZone } from '@angular/core';
import { IpcRenderer, IpcRendererEvent } from 'electron';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { NzNotificationService } from 'ng-zorro-antd/notification';

type EventCallback<T = any> = (event: IpcRendererEvent, ...args: T[]) => void;

@Injectable({
  providedIn: 'root'
})
export class IpcService {

  private readonly _ipc: IpcRenderer | undefined = undefined;

  public get ready(): boolean {
    return this._ipc !== undefined;
  }

  constructor(private zone: NgZone, private notification: NzNotificationService) {
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
      this.notification.error('Error', error.message);
    });
  }

  public getData<T = unknown>(channel: string, ...args: any[]): Observable<T> {
    return this.zone.run(() => {
      const response$ = new ReplaySubject<T>();
      this._ipc.on(`${channel}(${args.join(',')})`, (e, data) => {
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
    this._ipc.once(`${channel}(${args.join(',')})`, (e, data) => {
      response$.next(data);
      response$.complete();
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

  public sendEvent<T = any>(channel: string, data?: any): Observable<T> {
    const res$ = new Subject<T>();
    this.once(`${channel}:res`, (e, res) => {
      res$.next(res as T);
      res$.complete();
    });
    this.send(channel, data);
    return res$.asObservable();
  }
}
