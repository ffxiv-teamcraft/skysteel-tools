import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as KoboldActions from './kobold.actions';
import { first, map, switchMap } from 'rxjs/operators';
import { IpcService } from '../../ipc.service';

@Injectable()
export class KoboldEffects {

  loadSheetsList$ = createEffect(() =>
    this.actions$.pipe(
      ofType(KoboldActions.loadSheetsList),
      switchMap(() => {
        return this.ipc.getData<string[]>('kobold:sheet:list');
      }),
      map((list) => {
        return KoboldActions.sheetsListLoaded({ list });
      })
    )
  );

  loadSheetList$ = createEffect(() =>
    this.actions$.pipe(
      ofType(KoboldActions.loadSheet),
      switchMap(({ sheetName }) => {
        return this.ipc.getData<string[]>('kobold:sheet', sheetName).pipe(
          first(),
          map((sheet) => {
            return KoboldActions.sheetLoaded({ sheetName, sheet });
          })
        );
      })
    )
  );

  constructor(private actions$: Actions, private ipc: IpcService) {
  }
}
