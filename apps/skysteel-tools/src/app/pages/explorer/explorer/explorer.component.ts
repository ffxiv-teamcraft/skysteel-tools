import { ChangeDetectionStrategy, Component, ElementRef, ViewChild } from '@angular/core';
import { KoboldFacade } from '../../../core/kobold/+state/kobold.facade';
import { SaintFacade } from '../../../core/saint/+state/saint.facade';
import { ParserService } from '../../../core/parser/parser.service';
import { combineLatest, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { ParsedRow } from '../../../core/parser/model/parsed-row';
import { AbstractPageComponent } from '../../../core/abstract-page-component';

@Component({
  selector: 'skysteel-tools-explorer',
  templateUrl: './explorer.component.html',
  styleUrls: ['./explorer.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExplorerComponent extends AbstractPageComponent {
  tableContainerRef$ = new Subject<ElementRef>();

  @ViewChild('tableContainer')
  set tableContainerRef(ref: ElementRef) {
    this.tableContainerRef$.next(ref);
  }

  display$ = combineLatest([this.saint.selectedDefinition$, this.kobold.selectedSheet$, this.kobold.selectedSheetName$, this.tableContainerRef$]).pipe(
    filter(([definition, sheet, sheetName]) => definition && sheet && definition.sheet === sheetName),
    map(([definition, sheet, , tableContainerRef]) => {
      const rows = this.parser.parse(sheet, definition);
      const header = this.saint.getTableHeader(rows, sheet, definition);
      const columnsWidth = this.saint.getColumnsWidth(definition, rows, header);
      return {
        header,
        rows,
        columnsWidth,
        totalWidth: columnsWidth.reduce((acc, w) => acc + w, 0) + 'px',
        tableHeight: (tableContainerRef.nativeElement.offsetHeight - 100) + 'px'
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

  public trackByRowIndex(index: number, row: ParsedRow): string {
    return `${row.index}:${row.subIndex}`;
  }

}
