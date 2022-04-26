import { Injectable } from '@angular/core';
import {
  ComplexLinkConverter,
  KoboldSheetData,
  LinkConverter,
  SaintColumnDefinition,
  SaintConverter,
  SaintDefinition
} from '@skysteel-tools/models';
import { ParsedColumn } from './model/parsed-column';
import { ParsedRow } from './model/parsed-row';

@Injectable({
  providedIn: 'root'
})
export class ParserService {

  public parse(sheet: KoboldSheetData, definition: SaintDefinition): ParsedRow[] {
    const definitionsRegistry: Record<number, SaintColumnDefinition> = definition.definitions.reduce((acc, column) => {
      return {
        ...acc,
        [column.index || 0]: column
      };
    }, {} as Record<number, SaintColumnDefinition>);
    return sheet.content.map(row => {
      return {
        index: row.index,
        subIndex: row.subIndex,
        data: this.handleConverters(row.columns
            .reduce((acc, col, index) => {
              const columnDefinition = definitionsRegistry[index];
              return {
                ...acc,
                [columnDefinition?.name || index]: col.value
              };
            }, {}),
          definition
        )
      };
    });
  }

  private handleConverters(row: Record<string, ParsedColumn>, definition: SaintDefinition): Record<string, ParsedColumn> {
    return definition.definitions.reduce((res, col) => {
      if (col.converter) {
        return {
          ...res,
          [col.name]: this.convert(row, row[col.name], col.converter)
        };
      }
      return {
        ...res
      };
    }, row);
  }

  private convert(row: Record<string, ParsedColumn>, data: ParsedColumn, converter: SaintConverter): string {
    switch (converter.type) {
      case 'link':
        return this.convertLink(data, converter);
      case 'complexlink':
        return this.convertComplexLink(data, row, converter);
      case 'multiref':
        return `Multiref(${converter.targets.join(', ')})#${data}`;
      default:
        return `Converter(${converter.type})#${(data || 'undefined').toString()}`;
    }
  }

  convertLink(data: ParsedColumn, params: LinkConverter): string {
    return `${params.target}#${data}`;
  }

  convertComplexLink(data: ParsedColumn, row: Record<string, ParsedColumn>, params: ComplexLinkConverter): string {
    const matchingSheet = params.links.find(link => row[link.when.key] === link.when.value)?.sheet;
    if (matchingSheet) {
      return `${matchingSheet}#${data}`;
    } else {
      return `Unknown sheet#${data}`;
    }
  }
}
