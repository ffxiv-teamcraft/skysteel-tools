import { Injectable } from '@angular/core';

import { select, Store } from '@ngrx/store';

import * as SaintActions from './saint.actions';
import * as SaintSelectors from './saint.selectors';
import { SaintDefinition } from '@skysteel-tools/models';

@Injectable({
  providedIn: 'root'
})
export class SaintFacade {

  public availableDefinitions$ = this.store.pipe(
    select(SaintSelectors.getAllAvailableDefinitions)
  );

  public loadedDefinitions$ = this.store.pipe(
    select(SaintSelectors.getAllLoadedDefinitions)
  );

  public selectedDefinition$ = this.store.pipe(
    select(SaintSelectors.getSelectedDefinition)
  );

  constructor(private store: Store) {
  }

  public shiftColumn(definition: SaintDefinition, index: number, distance: number): SaintDefinition {
    return {
      ...definition,
      definitions: definition.definitions.map((column) => {
        const clone = JSON.parse(JSON.stringify(column));
        if (clone.index >= index) {
          clone.index += distance;
        }
        return clone;
      })
    };
  }

  public loadDefinitionsList(): void {
    this.store.dispatch(SaintActions.loadDefinitionsList());
  }

  public loadDefinition(sheetName: string): void {
    this.store.dispatch(SaintActions.loadDefinition({ sheetName }));
  }

  public selectDefinition(sheetName: string): void {
    this.store.dispatch(SaintActions.selectDefinition({ sheetName }));
  }

  public createDefinition(sheetName: string): void {
    this.store.dispatch(SaintActions.createDefinition({ sheetName }));
  }

  public updateDefinition(definition: SaintDefinition): void {
    this.store.dispatch(SaintActions.updateDefinition({ definition }));
  }

  public loadAllDefinitions(): void {
    this.store.dispatch(SaintActions.loadAllDefinitions());
  }

  public deleteDefinition(sheetName: string): void {
    this.store.dispatch(SaintActions.deleteDefinition({ sheetName }));
  }
}
