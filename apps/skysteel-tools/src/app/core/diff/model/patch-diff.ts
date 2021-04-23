import { SheetDiff } from './sheet-diff';

export interface PatchDiff {
  deletedSheets: string[];
  addedSheets: string[];
  changes: SheetDiff[];
}
