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

  public deleteDefinition(sheetName: string): void {
    this.store.dispatch(SaintActions.deleteDefinition({ sheetName }));
  }
}
