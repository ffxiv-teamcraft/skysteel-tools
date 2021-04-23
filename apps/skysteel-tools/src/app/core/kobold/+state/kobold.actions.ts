import { createAction, props } from '@ngrx/store';
import { KoboldSheetData } from '../../../../../../../libs/models/src';

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

export const loadAllSheets = createAction(
  '[Kobold] Load All Sheets',
  props<{ length: number }>()
);

export const allSheetsLoaded = createAction(
  '[Kobold] All Sheets Loaded',
  props<{ sheets: { name: string, data: KoboldSheetData }[] }>()
);

export const sheetLoaded = createAction(
  '[Kobold] Sheet Loaded',
  props<{ sheetName: string, sheet: KoboldSheetData }>()
);

export const selectSheet = createAction(
  '[Kobold] Select Sheet',
  props<{ sheetName: string }>()
);

