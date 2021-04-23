import { ParsedColumn } from './parsed-column';

export class ParsedRow {
  index: number;
  subIndex: number;
  data: Record<string, ParsedColumn>;
}
