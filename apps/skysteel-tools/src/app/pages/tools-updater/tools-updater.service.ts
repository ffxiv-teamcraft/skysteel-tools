import { Injectable } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { scan, startWith } from 'rxjs/operators';
import { IpcService } from '../../core/ipc.service';
import { initialUpdaterState } from './initial-updater-state';
import { Step } from './step';

@Injectable({
  providedIn: 'root'
})
export class ToolsUpdaterService {

  private stepUpdates$ = new Subject<Partial<Step> & { id: string }>();

  public state$ = this.stepUpdates$.pipe(
    scan((state, update) => {
      return {
        ...state,
        running: true,
        steps: state.steps.map(step => {
          if (step.id === update.id) {
            return {
              ...step,
              ...update
            };
          }
          return step;
        })
      };
    }, initialUpdaterState),
    startWith(initialUpdaterState)
  );

  constructor(private ipc: IpcService) {
  }

  public startUpdate(): Observable<Step[]> {
    return of([]);
  }

  public extractLGB(): Observable<void> {
    return this.ipc.sendEvent('UPDATE:LGB:Extract');
  }
}
