import { ChangeDetectionStrategy, Component, ElementRef, ViewChild } from '@angular/core';
import { KoboldFacade } from '../../../core/kobold/+state/kobold.facade';
import { SaintFacade } from '../../../core/saint/+state/saint.facade';
import { ParserService } from '../../../core/parser/parser.service';
import { combineLatest } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { SaintDefinition } from '@skysteel-tools/models';
import { ParsedRow } from '../../../core/parser/model/parsed-row';
import { AbstractPageComponent } from '../../../core/abstract-page-component';

@Component({
  selector: 'skysteel-tools-explorer',
  templateUrl: './explorer.component.html',
  styleUrls: ['./explorer.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExplorerComponent extends AbstractPageComponent {

  @ViewChild('tableContainer')
  tableContainerRef: ElementRef;

  display$ = combineLatest([this.saint.selectedDefinition$, this.kobold.selectedSheet$, this.kobold.selectedSheetName$]).pipe(
    filter(([definition, sheet, sheetName]) => definition && sheet && definition.sheet === sheetName),
    map(([definition, sheet]) => {
      const rows = this.parser.parse(sheet, definition);
      const header = Object.keys(rows[0].data).sort((a, b) => {
        return this.getIndex(a, definition) - this.getIndex(b, definition);
      });
      const columnsWidth = header.map(prop => {
        const col = definition.definitions.find(c => c.name === prop);
        const valueSize = rows[Math.floor(rows.length / 2)].data[prop].toString().length * 20;
        if (col) {
          if (col.converter) {
            return Math.max(200, col.name.length * 20);
          }
          return Math.max(valueSize, col.name.length * 20);
        }
        return Math.max(valueSize, 50);
      });
      return {
        header,
        rows,
        columnsWidth,
        totalWidth: columnsWidth.reduce((acc, w) => acc + w, 0) + 'px',
        tableHeight: (this.tableContainerRef.nativeElement.offsetHeight - 60) + 'px'
      };
    })
  );

  loading$ = combineLatest([this.saint.selectedDefinition$, this.kobold.selectedSheet$, this.kobold.selectedSheetName$]).pipe(
    map(([sheet, sheetName]) => sheetName && !sheet)
  );

  constructor(private kobold: KoboldFacade, private saint: SaintFacade,
              private parser: ParserService) {
    super();
  }

  private getIndex(key: string, definition: SaintDefinition): number {
    if (isNaN(+key)) {
      return definition.definitions.find(col => col.name === key).index || 0;
    }
    return +key;
  }

  public trackByRowIndex(index: number, row: ParsedRow): string {
    return `${row.index}:${row.subIndex}`;
  }

}
