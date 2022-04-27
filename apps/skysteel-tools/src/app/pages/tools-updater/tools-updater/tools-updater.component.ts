import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IpcService } from '../../../core/ipc.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { filter, map, startWith, switchMap } from 'rxjs/operators';
import { ToolsUpdaterService } from '../tools-updater.service';

@Component({
  selector: 'skysteel-tools-tools-updater',
  templateUrl: './tools-updater.component.html',
  styleUrls: ['./tools-updater.component.less'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class ToolsUpdaterComponent {
  public reloader$ = new BehaviorSubject(0);

  public XIVAPIconnected = false;
  public xivapiUsername = localStorage.getItem('XIVAPI:ID');
  public xivapiPassword = localStorage.getItem('XIVAPI:PW');
  public xivapiPath = 'H:\\WebstormProjects\\xivapi.com';

  public serverSCHash$ = this.reloader$.pipe(
    filter(() => this.XIVAPIconnected),
    switchMap(() => this.ipc.sendEvent('XIVAPI:SSH:SC-version')),
    map(res => res.split('\n')[2]),
    startWith('unknown')
  );
  public localSCHash$ = this.reloader$.pipe(
    filter(() => this.XIVAPIconnected),
    switchMap(() => this.ipc.sendEvent('XIVAPI:SC:version')),
    map(res => res.split('\n')[2]),
    startWith('unknown')
  );
  public latestSC$ = this.reloader$.pipe(
    switchMap(() => {
      return this.http.get<any>('https://api.github.com/repos/xivapi/SaintCoinach/releases/latest');
    }),
    map(release => {
      return release.tag_name;
    })
  );

  updaterState$ = this.updaterService.state$;

  constructor(private ipc: IpcService, private message: NzMessageService, private http: HttpClient,
              private updaterService: ToolsUpdaterService) {
  }

  startUpdater(): void {
    this.updaterService.extractLGB().subscribe();
  }

  connectXIVAPI(): void {
    this.ipc.once('XIVAPI:SSH:connect:res', (e, res) => {
      if (res === 1) {
        this.message.success('XIVAPI SSH Connected');
        this.XIVAPIconnected = true;
        localStorage.setItem('XIVAPI:ID', this.xivapiUsername);
        localStorage.setItem('XIVAPI:PW', this.xivapiPassword);
        this.reloader$.next(0);
      } else {
        console.error(res);
        this.message.error((res as Error).message as string);
      }
    });
    this.ipc.send('XIVAPI:SSH:connect', { username: this.xivapiUsername, password: this.xivapiPassword });
  }

}
