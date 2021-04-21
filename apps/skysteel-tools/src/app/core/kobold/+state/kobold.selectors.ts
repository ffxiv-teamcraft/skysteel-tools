import { createFeatureSelector, createSelector } from '@ngrx/store';
import { KOBOLD_FEATURE_KEY, KoboldPartialState, State } from './kobold.reducer';

// Lookup the 'Saint' feature state managed by NgRx
export const getKoboldState = createFeatureSelector<KoboldPartialState, State>(
  KOBOLD_FEATURE_KEY
);

export const getAllLoadedSheets = createSelector(
  getKoboldState,
  (state: State) => state.loadedSheets
);

export const getSelectedId = createSelector(
  getKoboldState,
  (state: State) => state.selectedSheet
);

export const getSelectedSheet = createSelector(
  getKoboldState,
  getSelectedId,
  (state: State, selectedId: string) => state.loadedSheets[selectedId]
);

export const getAllAvailableSheets = createSelector(
  getKoboldState,
  (state: State) => state.availableSheets
);
