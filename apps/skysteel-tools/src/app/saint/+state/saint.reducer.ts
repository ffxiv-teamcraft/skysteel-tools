import { Action, createReducer, on } from '@ngrx/store';

import * as SaintActions from './saint.actions';
import { SaintDefinition } from '@skysteel-tools/models';

export const SAINT_FEATURE_KEY = 'saint';

export interface State {
  availableDefinitions: string[];
  loadedDefinitions: Record<string, SaintDefinition>;
  selectedDefinition?: string;
}

export interface SaintPartialState {
  readonly [SAINT_FEATURE_KEY]: State;
}

export const initialState: State = {
  availableDefinitions: [],
  loadedDefinitions: {}
};

const saintReducer = createReducer(
  initialState,
  on(SaintActions.definitionsListLoaded, (state, { list }) => ({ ...state, availableDefinitions: list })),
  on(SaintActions.selectDefinition, (state, { sheetName }) => ({ ...state, selectedDefinition: sheetName })),
  on(SaintActions.definitionLoaded, (state, { definition }) => ({
    ...state,
    loadedDefinitions: { ...state.loadedDefinitions, [definition.sheet]: definition }
  })),
  on(SaintActions.deleteDefinition, (state, { sheetName }) => {
    const newLoadedDefinitions = { ...state.loadedDefinitions };
    delete newLoadedDefinitions[sheetName];
    return {
      ...state,
      loadedDefinitions: { ...newLoadedDefinitions }
    };
  })
);

export function reducer(state: State | undefined, action: Action) {
  return saintReducer(state, action);
}
