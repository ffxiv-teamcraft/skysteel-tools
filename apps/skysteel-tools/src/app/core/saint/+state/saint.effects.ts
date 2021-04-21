import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as SaintActions from './saint.actions';
import { IpcService } from '../../ipc.service';
import { first, map, switchMap } from 'rxjs/operators';
import { SaintDefinition } from '@skysteel-tools/models';
import { combineLatest } from 'rxjs';

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

  loadAllDefinitions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SaintActions.loadAllDefinitions),
      switchMap(() => {
        return this.ipc.getData<string[]>('saint:definitions:list').pipe(
          first(),
          switchMap((definitions) => {
            return combineLatest(definitions.map(definition => {
              return this.ipc.getDataFast<SaintDefinition>('saint:definition', definition);
            })).pipe(first());
          })
        );
      }),
      map(definitions => {
        return SaintActions.allDefinitionsLoaded({ definitions });
      })
    )
  );

  updateDefinition$ = createEffect(() =>
      this.actions$.pipe(
        ofType(SaintActions.updateDefinition),
        map(({ definition }) => {
          this.ipc.send('saint:definition:update', definition);
        })
      ),
    { dispatch: false }
  );

  createDefinition$ = createEffect(() =>
      this.actions$.pipe(
        ofType(SaintActions.createDefinition),
        map(({ sheetName }) => {
          this.ipc.send('saint:definition:create', sheetName);
        })
      ),
    { dispatch: false }
  );

  deleteDefinition$ = createEffect(() =>
      this.actions$.pipe(
        ofType(SaintActions.deleteDefinition),
        map(({ sheetName }) => {
          this.ipc.send('saint:definition:delete', sheetName);
        })
      ),
    { dispatch: false }
  );

  constructor(private actions$: Actions, private ipc: IpcService) {
  }
}
