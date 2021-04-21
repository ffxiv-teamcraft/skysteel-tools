import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as SaintActions from './saint.actions';
import { IpcService } from '../../core/ipc.service';
import { map, switchMap } from 'rxjs/operators';
import { SaintDefinition } from '@skysteel-tools/models';

@Injectable()
export class SaintEffects {

  loadDefinitionsList$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SaintActions.loadDefinitionsList),
      switchMap(() => {
        return this.ipc.getData<string[]>('saint:definitions:list');
      }),
      map((list) => {
        return SaintActions.definitionsListLoaded({ list });
      })
    )
  );

  loadDefinition$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SaintActions.loadDefinition),
      switchMap(({ sheetName }) => {
        return this.ipc.getData<SaintDefinition>('saint:definition', sheetName);
      }),
      map((definition) => {
        return SaintActions.definitionLoaded({ definition });
      })
    )
  );

  constructor(private actions$: Actions, private ipc: IpcService) {
  }
}
