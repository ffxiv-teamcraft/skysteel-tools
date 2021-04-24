import { Injectable } from '@angular/core';

import { select, Store } from '@ngrx/store';

import * as SaintActions from './saint.actions';
import * as SaintSelectors from './saint.selectors';
import { ColumnDataType, KoboldSheetData, SaintDefinition } from '@skysteel-tools/models';
import { ParsedRow } from '../../parser/model/parsed-row';

@Injectable({
  providedIn: 'root'
})
export class SaintFacade {

  public availableDefinitions$ = this.store.pipe(
    select(SaintSelectors.getAllAvailableDefinitions)
  );

  public loadedDefinitions$ = this.store.pipe(
    select(SaintSelectors.getAllLoadedDefinitions)
  );

  public selectedDefinition$ = this.store.pipe(
    select(SaintSelectors.getSelectedDefinition)
  );

  constructor(private store: Store) {
  }

  public shiftColumn(definition: SaintDefinition, index: number, distance: number): SaintDefinition {
    return {
      ...definition,
      definitions: definition.definitions.map((column) => {
        const clone = JSON.parse(JSON.stringify(column));
        if (clone.index >= index) {
          clone.index += distance;
        }
        return clone;
      })
    };
  }

  public getColumnsWidth(definition: SaintDefinition, rows: ParsedRow[], header: { name: string, type: string }[]): number[] {
    return header.map(headerCol => {
      const col = definition.definitions.find(c => c.name === headerCol.name);
      const valueSize = rows[Math.floor(rows.length / 2)].data[headerCol.name].toString().length * 20;
      if (col) {
        if (col.converter) {
          return Math.max(200, col.name.length * 20);
        }
        return Math.max(valueSize, col.name.length * 20);
      }
      return Math.max(valueSize, 100);
    });
  }

  public getTableHeader(parsedSheet: ParsedRow[], koboldSheet: KoboldSheetData, definition: SaintDefinition) {
    return Object.keys(parsedSheet[0].data)
      .map(key => {
        const columnIndex = this.getColumnIndex(key, definition);
        return {
          name: key,
          type: ColumnDataType[koboldSheet.content[0].columns[columnIndex]?.type]
        };
      })
      .sort((a, b) => {
        return this.getColumnIndex(a.name, definition) - this.getColumnIndex(b.name, definition);
      });
  }

  public getColumnIndex(key: string, definition: SaintDefinition): number {
    if (isNaN(+key)) {
      return definition.definitions.find(col => col.name === key).index || 0;
    }
    return +key;
  }

  public loadDefinitionsList(): void {
    this.store.dispatch(SaintActions.loadDefinitionsList());
  }

  public loadDefinition(sheetName: string): void {
    this.store.dispatch(SaintActions.loadDefinition({ sheetName }));
  }

  public selectDefinition(sheetName: string): void {
    this.store.dispatch(SaintActions.selectDefinition({ sheetName }));
  }

  public createDefinition(sheetName: string): void {
    this.store.dispatch(SaintActions.createDefinition({ sheetName }));
  }

  public updateDefinition(definition: SaintDefinition): void {
    this.store.dispatch(SaintActions.updateDefinition({ definition }));
  }

  public loadAllDefinitions(): void {
    this.store.dispatch(SaintActions.loadAllDefinitions());
  }

  public deleteDefinition(sheetName: string): void {
    this.store.dispatch(SaintActions.deleteDefinition({ sheetName }));
  }
}
