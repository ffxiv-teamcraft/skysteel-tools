import { Injectable } from '@angular/core';
import { intervalToDuration } from 'date-fns';
import { merge, Observable, of, Subject } from 'rxjs';
import { scan, startWith, switchMap, tap } from 'rxjs/operators';
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

  public start(version: string, isContentUpdate = true): void {
    if (isContentUpdate) {
      this.extractLGB().pipe(
        switchMap(() => this.updateLocalSaint()),
        switchMap(() => this.extractAllRawExd()),
        switchMap(() => this.extractUI()),
        switchMap(() => this.addPatchEntry(version)),
        switchMap(() => this.sendRawExd()),
        switchMap(() => this.runUpdater())
      ).subscribe();
    } else {
      this.updateLocalSaint().pipe(
        switchMap(() => this.extractAllRawExd()),
        switchMap(() => this.sendRawExd()),
        switchMap(() => this.runUpdater())
      ).subscribe();
    }
  }

  public runUpdater(): Observable<void> {
    this.startStep('xivapi:run-updater');
    const done$ = new Subject<void>();
    const start = new Date();
    const durationUpdater = setInterval(() => {
      const duration = intervalToDuration({ start, end: new Date() });
      this.updateStep('xivapi:run-updater', {
        subtitle: `${duration.hours.toString().padStart(2, '0')}:${duration.minutes.toString().padStart(2, '0')}:${duration.seconds.toString().padStart(2, '0')}`
      });
    }, 1000);

    this.ipc.execWithStdout<{ done: number, todo: number, workers: string[], comment: string }>('XIVAPI:SSH:run-updater')
      .subscribe(out => {
        if (out === 1) {
          this.updateStep('xivapi:run-updater', {
            description: '',
            status: 'finish'
          });
          done$.next();
          done$.complete();
          clearInterval(durationUpdater);
        } else if (typeof out === 'string') {
          this.updateStep('xivapi:run-updater', {
            description: out,
            workers: null
          });
        } else if (out.comment) {
          this.updateStep('xivapi:run-updater', {
            description: out.comment,
            progress: 100 * out.done / out.todo
          });
        } else {
          this.updateStep('xivapi:run-updater', {
            description: `${out.done}/${out.todo}`,
            workers: out.workers,
            progress: 100 * out.done / out.todo
          });
        }
      });
    return done$;
  }

  public sendRawExd(): Observable<void> {
    this.startStep('raw-exd-upload');
    const done$ = new Subject<void>();
    this.ipc.execWithStdout<string>('UPDATE:send-exd-zip')
      .subscribe(out => {
        if (out === 1) {
          this.updateStep('raw-exd-upload', {
            description: '',
            status: 'finish'
          });
          done$.next();
          done$.complete();
        } else {
          this.updateStep('raw-exd-upload', {
            description: out
          });
        }
      });
    return done$;
  }

  public addPatchEntry(version: string): Observable<void> {
    this.startStep('xivapi:datamining-patches');
    return this.ipc.exec('UPDATE:addPatchEntry', version).pipe(
      switchMap((result) => {
        if (result) {
          this.updateStep('xivapi:datamining-patches', {
            description: 'Patchlist.json entry added'
          });
          return this.ipc.exec('UPDATE:patches-repo').pipe(
            switchMap(() => {
              this.updateStep('xivapi:datamining-patches', {
                description: 'Running ffxiv-datamining-repo build.php'
              });
              return this.ipc.exec('UPDATE:build-patches', version);
            })
          );
        } else {
          this.updateStep('xivapi:datamining-patches', {
            description: 'No need to add a patch'
          });
          return of(null);
        }
      }),
      tap(() => this.finishStep('xivapi:datamining-patches'))
    );
  }

  public extractLGB(): Observable<void> {
    this.startStep('lgb');
    return this.ipc.exec('UPDATE:LGB:Extract').pipe(
      tap(() => this.finishStep('lgb'))
    );
  }

  public updateLocalSaint(): Observable<void> {
    this.startStep('sc:local:update');
    return this.ipc.exec('UPDATE:SC:LOCAL').pipe(
      tap(() => this.finishStep('sc:local:update'))
    );
  }

  public extractAllRawExd(): Observable<void> {
    this.startStep('sc:local:allrawexd');
    this.updateStep('sc:local:allrawexd', {
      progress: 1,
      description: 'Starting...'
    });
    const done$ = new Subject<void>();
    this.ipc.execWithStdout<string>('UPDATE:SC:allrawexd')
      .subscribe(out => {
        if (out === 1) {
          this.updateStep('sc:local:allrawexd', {
            description: '',
            status: 'finish'
          });
          done$.next();
          done$.complete();
        } else if (out.startsWith('[')) {
          const parsed = /\[(\d+)\/(\d+)] Processing: (\w+)\s-/g.exec(out);
          if (parsed) {
            //[1177/6452] Processing: EmoteMode - Language:
            const [, done, todo, sheet] = parsed;

            this.updateStep('sc:local:allrawexd', {
              description: `[${done}/${todo}] ${sheet}`,
              progress: 100 * +done / +todo
            });
          }
        }
      });
    return done$;
  }

  public extractUI(): Observable<void> {
    this.startStep('sc:local:ui');
    this.startStep('sc:local:uiHD');
    this.startStep('sc:local:maps');
    const ui$ = this.ipc.exec('UPDATE:SC:ui').pipe(
      tap(() => {
        this.updateStep('sc:local:ui', {
          description: 'Filezilla instance opened',
          status: 'finish'
        });
      })
    );
    const uiHD$ = this.ipc.exec('UPDATE:SC:uiHD').pipe(
      tap(() => {
        this.ipc.exec('filezilla:open', 'ICONS');
        this.updateStep('sc:local:uiHD', {
          description: 'Filezilla instance opened',
          status: 'finish'
        });
      })
    );
    const maps$ = this.ipc.exec('UPDATE:SC:maps').pipe(
      tap(() => {
        this.ipc.exec('filezilla:open', 'MAPS');
        this.updateStep('sc:local:maps', {
          description: 'Filezilla instance opened',
          status: 'finish'
        });
      })
    );
    return merge(ui$, uiHD$, maps$);
  }

  private startStep(id: string): void {
    this.updateStep(id, {
      status: 'process'
    });
  }

  private finishStep(id: string): void {
    this.updateStep(id, {
      status: 'finish',
      progress: 100
    });
  }

  private updateStep(id: string, update: Partial<Step>): void {
    this.stepUpdates$.next({
      id,
      ...update
    });
  }
}
