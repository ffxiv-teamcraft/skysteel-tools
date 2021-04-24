import { ChangeDetectorRef, Component, NgZone } from '@angular/core';
import { ColumnDataType, KoboldSheetData, SaintDefinition } from '@skysteel-tools/models';
import { map, tap } from 'rxjs/operators';
import { DiffService } from '../../../core/diff/diff.service';
import { SheetDiffType } from '../../../core/diff/model/sheet-diff-type';
import { SaintFacade } from '../../../core/saint/+state/saint.facade';
import { ColumnDiff } from '../../../core/diff/model/column-diff';
import { NzModalService } from 'ng-zorro-antd/modal';
import { SheetPreviewComponent } from '../../../modules/sheet-preview/sheet-preview/sheet-preview.component';
import { ParserService } from '../../../core/parser/parser.service';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { SheetDiff } from '../../../core/diff/model/sheet-diff';

@Component({
  selector: 'skysteel-tools-patch-diff',
  templateUrl: './patch-diff.component.html',
  styleUrls: ['./patch-diff.component.less']
})
export class PatchDiffComponent {

  public SheetDiffType = SheetDiffType;

  public ColumnDataType = ColumnDataType;

  public baseDiff$ = this.diffService.getDiff().pipe(
    tap(() => {
      setTimeout(() => {
        this.cd.detectChanges();
      });
    })
  );

  public appliedDiffs$ = new BehaviorSubject<SheetDiff[]>([]);
  public createdSheets$ = new BehaviorSubject<string[]>([]);
  public deletedSheets$ = new BehaviorSubject<string[]>([]);

  public diff$ = combineLatest([this.baseDiff$, this.appliedDiffs$, this.createdSheets$, this.deletedSheets$]).pipe(
    map(([diff, applied, created, deleted]) => {
      return {
        ...diff,
        deletedSheets: diff.deletedSheets.filter(s => !deleted.includes(s)),
        addedSheets: diff.addedSheets.filter(s => !created.includes(s)),
        changes: diff.changes
          .map(change => {
            const appliedSheetChanges = applied.find(a => a.sheet === change.sheet);
            if (!appliedSheetChanges) {
              return { ...change };
            }
            return {
              ...change,
              diff: change.diff.filter(row => {
                return !appliedSheetChanges.diff.some(d => d.index === row.index);
              })
            };
          })
          .filter(change => change.diff.length > 0)
      };
    })
  );

  constructor(private diffService: DiffService, private saint: SaintFacade,
              private parser: ParserService, private cd: ChangeDetectorRef,
              private modal: NzModalService, private zone: NgZone) {
  }

  public deleteDefinition(sheetName: string): void {
    this.saint.deleteDefinition(sheetName);
    this.deletedSheets$.next([...this.deletedSheets$.value, sheetName]);
  }

  public deleteAllDefinitions(sheetNames: string[]): void {
    sheetNames.forEach(sheet => {
      this.deleteDefinition(sheet);
    });
  }

  public createDefinition(sheetName: string): void {
    this.saint.createDefinition(sheetName);
    this.createdSheets$.next([...this.createdSheets$.value, sheetName]);
  }

  public createAllDefinitions(sheetNames: string[]): void {
    sheetNames.forEach(sheet => {
      this.createDefinition(sheet);
    });
  }

  public previewChanges(definition: SaintDefinition, sheetData: KoboldSheetData, changes: ColumnDiff[]): void {
    this.zone.run(() => {
      const editedDefinition = this.diffService.applyChanges(definition, ...changes);
      const parsedSheet = this.parser.parse(sheetData, editedDefinition);
      const columnsDiff = changes.reduce((acc, change) => {
        const copy = [...acc];
        copy[change.index] = change.type;
        return copy;
      }, []);
      this.modal.create({
        nzContent: SheetPreviewComponent,
        nzComponentParams: {
          definition: editedDefinition,
          koboldSheet: sheetData,
          parsedSheet,
          columnsDiff
        },
        nzWidth: '90%',
        nzClosable: false,
        nzOnOk: () => {
          this.saint.updateDefinition(editedDefinition);
          this.appliedDiffs$.next([...this.appliedDiffs$.value, { sheet: definition.sheet, diff: [...changes] }]);
        }
      });
    });
  }

  public getDiffColor(diffType: SheetDiffType): string {
    switch (diffType) {
      case SheetDiffType.ADDED:
        return 'success';
      case SheetDiffType.MODIFIED:
        return 'warning';
      case SheetDiffType.REMOVED:
        return 'error';
    }
  }

  public getDiffIcon(diffType: SheetDiffType): string {
    switch (diffType) {
      case SheetDiffType.ADDED:
        return 'plus';
      case SheetDiffType.MODIFIED:
        return 'edit';
      case SheetDiffType.REMOVED:
        return 'delete';
    }
  }

}
