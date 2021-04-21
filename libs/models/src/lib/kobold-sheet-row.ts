import { ColumnDataType } from '@kobold/excel/dist/files';

export interface KoboldSheetRowBoolean {
  type: ColumnDataType.BOOLEAN |
    ColumnDataType.PACKED_BOOL_0 |
    ColumnDataType.PACKED_BOOL_1 |
    ColumnDataType.PACKED_BOOL_2 |
    ColumnDataType.PACKED_BOOL_3 |
    ColumnDataType.PACKED_BOOL_4 |
    ColumnDataType.PACKED_BOOL_5 |
    ColumnDataType.PACKED_BOOL_6 |
    ColumnDataType.PACKED_BOOL_7;
  value: boolean;
}

export interface KoboldSheetRowString {
  type: ColumnDataType.STRING;
  value: string;
}

export interface KoboldSheetRowNumber {
  type: ColumnDataType.INT_8 |
    ColumnDataType.UINT_8 |
    ColumnDataType.INT_16 |
    ColumnDataType.UINT_16 |
    ColumnDataType.INT_32 |
    ColumnDataType.UINT_32 |
    ColumnDataType.FLOAT_32;
  value: number;
}

export interface KoboldSheetRowBigInt {
  type: ColumnDataType.INT_64 |
    ColumnDataType.UINT_64;
  value: bigint;
}

export type KoboldSheetRow = KoboldSheetRowBoolean | KoboldSheetRowString
  | KoboldSheetRowNumber | KoboldSheetRowBigInt;
