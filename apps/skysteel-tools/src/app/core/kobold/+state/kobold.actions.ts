import { createAction, props } from '@ngrx/store';

export const loadSheetsList = createAction(
  '[Kobold] Load SheetsList');

export const sheetsListLoaded = createAction(
  '[Kobold] Sheets List Loaded',
  props<{ list: string[] }>()
);

export const loadSheet = createAction(
  '[Kobold] Load Sheet',
  props<{ sheetName: string }>()
);

export const sheetLoaded = createAction(
  '[Kobold] Sheet Loaded',
  props<{ sheetName: string, sheet: any }>()
);

export const selectSheet = createAction(
  '[Kobold] Select Sheet',
  props<{ sheetName: string }>()
);

