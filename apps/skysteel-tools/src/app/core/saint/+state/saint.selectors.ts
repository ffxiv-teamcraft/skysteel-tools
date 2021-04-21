import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SAINT_FEATURE_KEY, SaintPartialState, State } from './saint.reducer';

// Lookup the 'Saint' feature state managed by NgRx
export const getSaintState = createFeatureSelector<SaintPartialState, State>(
  SAINT_FEATURE_KEY
);

export const getAllLoadedDefinitions = createSelector(
  getSaintState,
  (state: State) => state.loadedDefinitions
);

export const getSelectedId = createSelector(
  getSaintState,
  (state: State) => state.selectedDefinition
);

export const getSelectedDefinition = createSelector(
  getSaintState,
  getSelectedId,
  (state: State, selectedId: string) => state.loadedDefinitions[selectedId]
);

export const getAllAvailableDefinitions = createSelector(
  getSaintState,
  (state: State) => state.availableDefinitions
);
