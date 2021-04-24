import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ParsedRow } from '../../../core/parser/model/parsed-row';
import { SheetDiffType } from '../../../core/diff/model/sheet-diff-type';
import { KoboldSheetData, SaintDefinition } from '../../../../../../../libs/models/src';
import { SaintFacade } from '../../../core/saint/+state/saint.facade';
import { NzTableComponent } from 'ng-zorro-antd/table';

@Component({
  selector: 'skysteel-tools-sheet-preview',
  templateUrl: './sheet-preview.component.html',
  styleUrls: ['./sheet-preview.component.less']
})
export class SheetPreviewComponent implements OnInit {

  @Input()
  definition: SaintDefinition;

  @Input()
  koboldSheet: KoboldSheetData;

  @Input()
  parsedSheet: ParsedRow[];

  @Input()
  columnsDiff: SheetDiffType[];

  @ViewChild(NzTableComponent, { static: true })
  tableComponentRef: NzTableComponent;

  params: { header: { name: string, type: string }[], columnsWidth: number[], totalWidth: string, diff: string[] };

  constructor(private saint: SaintFacade) {
  }

  public trackByRowIndex(index: number, row: ParsedRow): string {
    return `${row.index}:${row.subIndex}`;
  }

  ngOnInit(): void {
    const header = this.saint.getTableHeader(this.parsedSheet, this.koboldSheet, this.definition);
    const columnsWidth = this.saint.getColumnsWidth(this.definition, this.parsedSheet, header);
    this.params = {
      header,
      columnsWidth: columnsWidth,
      totalWidth: `${columnsWidth.reduce((acc, width) => acc + width, 0)}px`,
      diff: (this.columnsDiff || []).map(diffType => SheetDiffType[diffType]?.toLowerCase() || null)
    };
  }

}
