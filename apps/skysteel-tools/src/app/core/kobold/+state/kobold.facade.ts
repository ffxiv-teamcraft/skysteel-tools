import { Injectable } from '@angular/core';

import { select, Store } from '@ngrx/store';

import * as KoboldActions from './kobold.actions';
import * as KoboldSelectors from './kobold.selectors';

@Injectable({
  providedIn: 'root'
})
export class KoboldFacade {

  public availableSheets$ = this.store.pipe(
    select(KoboldSelectors.getAllAvailableSheets)
  );

  public loadedSheets$ = this.store.pipe(
    select(KoboldSelectors.getAllLoadedSheets)
  );

  public selectedSheet$ = this.store.pipe(
    select(KoboldSelectors.getSelectedSheet)
  );

  public selectedSheetName$ = this.store.pipe(
    select(KoboldSelectors.getSelectedId)
  );

  constructor(private store: Store) {
  }

  public loadSheetsList(): void {
    this.store.dispatch(KoboldActions.loadSheetsList());
  }

  /**
   * Loads all sheets at once
   * @param length The amount of rows we want for each sheet
   */
  public loadAllSheets(length: number): void {
    this.store.dispatch(KoboldActions.loadAllSheets({length}));
  }

  public loadSheet(sheetName: string): void {
    this.store.dispatch(KoboldActions.loadSheet({ sheetName }));
  }

  public selectSheet(sheetName: string): void {
    this.store.dispatch(KoboldActions.selectSheet({ sheetName }));
  }
}
