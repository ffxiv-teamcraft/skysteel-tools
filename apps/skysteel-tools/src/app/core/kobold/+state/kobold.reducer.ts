import { Action, createReducer, on } from '@ngrx/store';

import * as KoboldActions from './kobold.actions';

export const KOBOLD_FEATURE_KEY = 'kobold';

export interface State {
  availableSheets: string[];
  loadedSheets: Record<string, any>;
  selectedSheet?: string;
}

export interface KoboldPartialState {
  readonly [KOBOLD_FEATURE_KEY]: State;
}

export const initialState: State = {
  availableSheets: [],
  loadedSheets: {}
};

const koboldReducer = createReducer(
  initialState,
  on(KoboldActions.sheetsListLoaded, (state, { list }) => ({ ...state, availableSheets: list })),
  on(KoboldActions.selectSheet, (state, { sheetName }) => ({ ...state, selectedSheet: sheetName })),
  on(KoboldActions.sheetLoaded, (state, { sheetName, sheet }) => ({
    ...state,
    loadedSheets: { ...state.loadedSheets, [sheetName]: sheet }
  }))
);

export function reducer(state: State | undefined, action: Action) {
  return koboldReducer(state, action);
}
