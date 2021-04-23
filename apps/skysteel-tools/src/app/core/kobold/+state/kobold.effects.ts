import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as KoboldActions from './kobold.actions';
import { bufferCount, first, map, switchMap } from 'rxjs/operators';
import { IpcService } from '../../ipc.service';
import { concat } from 'rxjs';
import { KoboldSheetData } from '@skysteel-tools/models';

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
        return this.ipc.getData<KoboldSheetData>('kobold:sheet', sheetName).pipe(
          first(),
          map((sheet) => {
            return KoboldActions.sheetLoaded({ sheetName, sheet });
          })
        );
      })
    )
  );

  loadAllSheets$ = createEffect(() =>
    this.actions$.pipe(
      ofType(KoboldActions.loadAllSheets),
      switchMap(({ length }) => {
        return this.ipc.getData<string[]>('kobold:sheet:list').pipe(
          first(),
          switchMap((sheets) => {
            return concat(
              ...sheets.map(name => {
                return this.ipc.getDataFast<KoboldSheetData>('kobold:sheet', name, length).pipe(
                  map(data => {
                    return { name, data };
                  })
                );
              })
            ).pipe(
              bufferCount(sheets.length),
              first()
            );
          })
        );
      }),
      map(sheets => {
        return KoboldActions.allSheetsLoaded({ sheets });
      })
    )
  );

  constructor(private actions$: Actions, private ipc: IpcService) {
  }
}
