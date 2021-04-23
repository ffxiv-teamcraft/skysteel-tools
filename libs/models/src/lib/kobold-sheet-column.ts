import { ColumnDataType } from './column-data-type';

export interface KoboldSheetColumnBoolean {
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

export interface KoboldSheetColumnString {
  type: ColumnDataType.STRING;
  value: string;
}

export interface KoboldSheetColumnNumber {
  type: ColumnDataType.INT_8 |
    ColumnDataType.UINT_8 |
    ColumnDataType.INT_16 |
    ColumnDataType.UINT_16 |
    ColumnDataType.INT_32 |
    ColumnDataType.UINT_32 |
    ColumnDataType.FLOAT_32;
  value: number;
}

export interface KoboldSheetColumnBigInt {
  type: ColumnDataType.INT_64 |
    ColumnDataType.UINT_64;
  value: bigint;
}

export type KoboldSheetColumn = KoboldSheetColumnBoolean | KoboldSheetColumnString
  | KoboldSheetColumnNumber | KoboldSheetColumnBigInt;
