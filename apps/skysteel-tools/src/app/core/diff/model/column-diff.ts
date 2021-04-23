import { ColumnDataType } from '@skysteel-tools/models';
import { SheetDiffType } from './sheet-diff-type';

export interface ColumnDiff {
  index: number;
  type: SheetDiffType;
  dataType?: ColumnDataType;
}
