import { createAction, props } from '@ngrx/store';
import { SaintDefinition } from '@skysteel-tools/models';

export const loadDefinitionsList = createAction(
  '[Saint] Load Definitions List');

export const definitionsListLoaded = createAction(
  '[Saint] Definitions List Loaded',
  props<{ list: string[] }>()
);

export const loadAllDefinitions = createAction(
  '[Saint] Load All Definitions');

export const allDefinitionsLoaded = createAction(
  '[Saint] All Definitions Loaded',
  props<{ definitions: SaintDefinition[] }>()
);

export const loadDefinition = createAction(
  '[Saint] Load Definition',
  props<{ sheetName: string }>()
);

export const definitionLoaded = createAction(
  '[Saint] Definition Loaded',
  props<{ definition: SaintDefinition }>()
);

export const selectDefinition = createAction(
  '[Saint] Select Definition',
  props<{ sheetName: string }>()
);

export const createDefinition = createAction(
  '[Saint] Create Definition',
  props<{ sheetName: string }>()
);

export const updateDefinition = createAction(
  '[Saint] Update Definition',
  props<{ definition: SaintDefinition }>()
);

export const deleteDefinition = createAction(
  '[Saint] Delete Definition',
  props<{ sheetName: string }>()
);

