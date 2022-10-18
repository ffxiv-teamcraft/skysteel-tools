import { Injectable } from '@angular/core';
import { IpcService } from '../ipc.service';
import { KoboldFacade } from '../kobold/+state/kobold.facade';
import { combineLatest, concat, Observable } from 'rxjs';
import { bufferCount, filter, first, map, switchMap } from 'rxjs/operators';
import { SaintFacade } from '../saint/+state/saint.facade';
import { ColumnDataType, KoboldSheetColumn, KoboldSheetData, SaintDefinition } from '@skysteel-tools/models';
import { SheetDiffType } from './model/sheet-diff-type';
import { ColumnDiff } from './model/column-diff';
import { PatchDiff } from './model/patch-diff';
import { SheetDiff } from './model/sheet-diff';

@Injectable({
  providedIn: 'root'
})
export class DiffService {

  private static MATCH_PERCENT_THRESHOLD = 75;

  constructor(private ipc: IpcService, private kobold: KoboldFacade,
              private saint: SaintFacade) {
  }

  public getDiff(): Observable<PatchDiff> {
    this.kobold.loadSheetsList();
    // 47 because we're reading 50 lines of CSV minus the 3 lines of header for CSV file
    this.kobold.loadAllSheets(47);
    this.saint.loadDefinitionsList();
    this.saint.loadAllDefinitions();
    return combineLatest([this.kobold.availableSheets$, this.kobold.loadedSheets$, this.saint.availableDefinitions$, this.saint.loadedDefinitions$]).pipe(
      filter(([availableSheets, loadedSheets, availableDefinitions, loadedDefinitions]) => {
        return availableSheets.length > 0 && Object.keys(loadedSheets).length === availableSheets.length
          && availableDefinitions.length > 0 && Object.keys(loadedDefinitions).length === availableDefinitions.length;
      }),
      first(),
      switchMap(([availableSheets, loadedSheets, availableDefinitions, loadedDefinitions]) => {
        return concat(...availableSheets.map(sheetName => {
          return this.ipc.getDataFast<string[][]>('csv:sheet', sheetName).pipe(
            map(csv => {
              return {
                sheet: sheetName,
                csv
              };
            })
          );
        })).pipe(
          bufferCount(availableSheets.length),
          first(),
          map(csvSheets => this.generateDiff(csvSheets.filter(csvSheet => csvSheet.csv.length > 0), loadedSheets, availableDefinitions, loadedDefinitions))
        );
      })
    );
  }

  public applyChanges(definition: SaintDefinition, ...changes: ColumnDiff[]): SaintDefinition {
    return {
      ...definition,
      definitions: changes.reduce((acc, change) => {
        switch (change.type) {
          case SheetDiffType.ADDED:
            return acc.map(col => {
              const newColIndex = (col.index || 0) >= change.index ? (col.index || 0) + 1 : col.index;
              return {
                ...col,
                index: newColIndex
              };
            });
          case SheetDiffType.REMOVED:
            return acc.map(col => {
              const newColIndex = (col.index || 0) >= change.index ? (col.index || 0) - 1 : col.index;
              return {
                ...col,
                index: newColIndex
              };
            });
          case SheetDiffType.MODIFIED:
            return acc.filter(col => {
              return (col.index || 0) !== change.index;
            });
        }
      }, definition.definitions)
    };
  }

  private generateDiff(csvSheets: { sheet: string, csv: string[][] }[], koboldSheets: Record<string, KoboldSheetData>, definitions: string[], loadedDefinitions: Record<string, SaintDefinition>): PatchDiff {
    const deletedSheets = definitions
      .filter(sheet => koboldSheets[sheet] === undefined);
    const addedSheets = Object.keys(koboldSheets)
      .filter(sheet => !csvSheets.some(csv => csv.sheet === sheet) && !definitions.includes(sheet));
    const changes = csvSheets
      // Let's remove the missing csv sheets from last patch, prob due to unneeded definition
      .filter(csvSheet => csvSheet.csv.length > 0)
      .reduce((acc, csvSheet) => {
        // We're skipping the first 3 rows because it's basically header, name and type
        const csvRows = csvSheet.csv.slice(3);
        // Skip first row for kobold to align both values
        const koboldRows = koboldSheets[csvSheet.sheet].content.map(row => row.columns);
        const diff = this.getDiffBetweenSheets(csvRows, koboldRows)
          .filter((diff: ColumnDiff) => {
            return !this.isDiffApplied(diff, loadedDefinitions[csvSheet.sheet], csvSheet.csv[1]);
          });
        if (diff.length > 0) {
          return [
            ...acc,
            {
              sheet: csvSheet.sheet,
              definition: loadedDefinitions[csvSheet.sheet],
              koboldSheetData: koboldSheets[csvSheet.sheet],
              diff
            }
          ];
        }
        return acc;
      }, [] as SheetDiff[]);
    return { deletedSheets, addedSheets, changes };
  }

  private getDiffBetweenSheets(csvSheet: string[][], koboldSheet: KoboldSheetColumn[][]): ColumnDiff[] {
    const diffColumnLength = koboldSheet[0].length - csvSheet[0].length;
    return new Array(csvSheet[0].length).fill(null)
      .reduce((acc, _, index) => {
        const csvColumn = this.getEntireColumn(index, csvSheet, false);
        const koboldColumn = this.getEntireColumn(index, koboldSheet, true);
        const koboldDataType = koboldSheet[0][index + acc.currentShift]?.type;
        if (this.percentMatch(csvColumn, koboldColumn, koboldDataType) > DiffService.MATCH_PERCENT_THRESHOLD) {
          // Columns matching enough for us to consider it didn't change.
          return acc;
        }
        const newIndex = this.findNewIndex(csvColumn, koboldSheet);
        const shift = newIndex - index - acc.currentShift;
        if (shift > 0 && diffColumnLength > 0) {
          return {
            ...acc,
            currentShift: acc.currentShift + shift,
            diff: [
              ...acc.diff,
              ...new Array(shift)
                .fill(null)
                .map((_, i) => {
                  return {
                    index: index + acc.currentShift + i,
                    type: SheetDiffType.ADDED,
                    dataType: koboldSheet[0][index + acc.currentShift + i]?.type
                  };
                })
            ]
          };
        } else if (newIndex === -1 && diffColumnLength < 0) {
          return {
            ...acc,
            currentShift: acc.currentShift - 1,
            diff: [
              ...acc.diff,
              {
                index: index,
                type: SheetDiffType.REMOVED
              }
            ]
          };
        } else if (acc.currentShift === 0 && !this.typeMatch(csvColumn, koboldDataType)) {
          return {
            ...acc,
            currentShift: acc.currentShift + shift,
            diff: [
              ...acc.diff,
              {
                index: index,
                type: SheetDiffType.MODIFIED,
                dataType: koboldDataType
              }
            ]
          };
        } else {
          return acc;
        }
      }, {
        currentShift: 0,
        diff: [] as ColumnDiff[]
      })
      .diff;
  }

  private getEntireColumn(columnIndex: number, table: Array<string[] | KoboldSheetColumn[]>, fromKobold: boolean): string[] {
    return table.map(row => {
      const data = row[columnIndex];
      if (data === undefined) {
        return undefined;
      }
      if (fromKobold) {
        return (data as KoboldSheetColumn).value.toString().toLowerCase();
      }
      return data.toString().toLowerCase();
    });
  }

  private findNewIndex(csvColumn: string[], kobold: KoboldSheetColumn[][]): number {
    return new Array(kobold.length)
      .fill(null)
      .findIndex((_, i) => {
        return this.percentMatch(csvColumn, this.getEntireColumn(i, kobold, true), kobold[0][i]?.type) === 100;
      });
  }

  private percentMatch(csv: string[], kobold: string[], koboldDataType: ColumnDataType): number {
    if (csv.length > kobold.length && kobold.length === 1) {
      // This often happens because the sheet is about to be deleted in next patch or so, just ignore it and
      // act like if it wasn't modified
      return 100;
    }
    const matches = csv.filter((value, i) => {
      // Special case due to csv parsing getting undefined for empty strings
      if (kobold[i] === '' && value === undefined) {
        return true;
      }
      // Float accuracy in csv sheets
      if (koboldDataType === 9) {
        return Math.floor(+value * 100) / 100 === Math.floor(+kobold[i] * 100) / 100;
      }
      // SEStrings (parametrized strings)
      // type 0 is string but since the enum is inside a file that requires zlib and other stuff,
      // we're just using the value directly
      if (value && kobold[i] && koboldDataType === 0) {
        return /<[^>]+>/.test(value) || this.similarity(value, kobold[i]) > 0.75;
      }
      // Special case for possible Quad converters
      // kobold renders them as bigint and Saint renders them as `x, y, z, a`
      // &&
      if (value && value.split(',').length === 4) {
        return [0xA, 0xB].includes(koboldDataType);
      }
      return kobold[i] === value;
    });
    return 100 * matches.length / csv.length;
  }

  private typeMatch(csv: string[], koboldDataType: ColumnDataType): boolean {
    // Pick the best row to test this,
    // This means basically either highest number (to test against bounds)
    // or longest string (to make sure we're not picking an empty one)
    const csvRow = csv.sort((a, b) => {
      const aScore = isNaN(+a) ? a.length : +a;
      const bScore = isNaN(+b) ? b.length : +b;
      return bScore - aScore;
    })[0];

    // We're using enum values directly because else it won't build because of zlib
    // TODO use the real enum references here
    switch (koboldDataType) {
      case 0x0: //STRING
        return /\w+/gmi.test(csvRow);
      case 0x1: //BOOLEAN or PACKED_BOOL_X
      case 0x19:
      case 0x1a:
      case 0x1b:
      case 0x1c:
      case 0x1d:
      case 0x1e:
      case 0x1f:
      case 0x20:
        return ['true', 'false'].includes(csvRow.toLowerCase());
      case 0x2: // int_8
        return Math.abs(+csvRow) < Math.pow(2, 8) / 2;
      case 0x3: // uint_8
        return +csvRow >= 0 && +csvRow < Math.pow(2, 8);
      case 0x4: // int_16
        return Math.abs(+csvRow) < Math.pow(2, 16) / 2;
      case 0x5: // uint_16
        return +csvRow >= 0 && +csvRow < Math.pow(2, 16);
      case 0x6: // int_32
        return Math.abs(+csvRow) < Math.pow(2, 32) / 2;
      case 0x7: // uint_32
      case 0x9: // float_32
        return +csvRow >= 0 && +csvRow < Math.pow(2, 32);
      case 0xa: // int_64
        return BigInt(csvRow) < BigInt(Math.pow(2, 64)) / BigInt(2);
      case 0xb: // uint_64
        return BigInt(csvRow) >= 0 && BigInt(csvRow) < BigInt(Math.pow(2, 64)) / BigInt(2);
      default:
        return false;
    }
  }

  // https://stackoverflow.com/questions/10473745/compare-strings-javascript-return-of-likely
  private similarity(s1: string, s2: string): number {
    let longer = s1;
    let shorter = s2;
    if (s1.length < s2.length) {
      longer = s2;
      shorter = s1;
    }
    const longerLength = longer.length;
    if (longerLength == 0) {
      return 1.0;
    }
    return (longerLength - this.editDistance(longer, shorter)) / longerLength;
  }

  private editDistance(s1: string, s2: string): number {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();

    const costs = [];
    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i == 0)
          costs[j] = j;
        else {
          if (j > 0) {
            let newValue = costs[j - 1];
            if (s1.charAt(i - 1) != s2.charAt(j - 1))
              newValue = Math.min(Math.min(newValue, lastValue),
                costs[j]) + 1;
            costs[j - 1] = lastValue;
            lastValue = newValue;
          }
        }
      }
      if (i > 0)
        costs[s2.length] = lastValue;
    }
    return costs[s2.length];
  }

  private isDiffApplied(diff: ColumnDiff, definition: SaintDefinition, csvHeader: string[]): boolean {
    const closestNextCsvHeaderWithName = csvHeader
      .slice(diff.index)
      .filter(col => !!col)
      .map(col => definition.definitions.find(d => d.name === col))
      .find(col => col !== undefined);
    if (!closestNextCsvHeaderWithName) {
      /*
       This happens if a column has been added after all our definitions
       For instance a sheet with 3 defined columns out of 7, only the 3 first ones.
       If a column is added at #6, a change will be detected but impossible to apply basically, because
       it has no impact on Definition file.
       */
      return true;
    }
    switch (diff.type) {
      case SheetDiffType.ADDED:
        // Make sure the index of the closest next header is lower in CSV than in the Definition
        return csvHeader.indexOf(closestNextCsvHeaderWithName.name) < closestNextCsvHeaderWithName.index;
      case SheetDiffType.REMOVED:
        // Make sure the index of the closest next header is higher in CSV than in the Definition
        return csvHeader.indexOf(closestNextCsvHeaderWithName.name) > closestNextCsvHeaderWithName.index;
      case SheetDiffType.MODIFIED:
        return definition.definitions.some(d => d.index === diff.index);
    }
  }
}
