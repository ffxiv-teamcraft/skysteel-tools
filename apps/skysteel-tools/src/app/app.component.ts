import { Component } from '@angular/core';
import { map } from 'rxjs/operators';
import { IpcService } from './core/ipc.service';

@Component({
  selector: 'skysteel-tools-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {
  isCollapsed = true;

  saintStatus$ = this.ipc.getData<string>('saint:path').pipe(
    map(path => {
      return {
        pathSet: !!path
      };
    })
  );

  constructor(private ipc: IpcService) {
  }

  pickSaintFolder(): void {
    this.ipc.send('saint:path:pick');
  }
}
