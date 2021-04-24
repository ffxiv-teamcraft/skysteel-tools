import { ColumnDiff } from './column-diff';
import { KoboldSheetData, SaintDefinition } from '@skysteel-tools/models';

export class SheetDiff {
  sheet: string;
  definition?: SaintDefinition;
  koboldSheetData?: KoboldSheetData;
  diff: ColumnDiff[];
}
