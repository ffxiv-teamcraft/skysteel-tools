import { ChangeDetectorRef, Component } from '@angular/core';
import { ColumnDataType } from '@skysteel-tools/models';
import { tap } from 'rxjs/operators';
import { DiffService } from '../../../core/diff/diff.service';
import { SheetDiffType } from '../../../core/diff/model/sheet-diff-type';
import { SaintFacade } from '../../../core/saint/+state/saint.facade';

@Component({
  selector: 'skysteel-tools-patch-diff',
  templateUrl: './patch-diff.component.html',
  styleUrls: ['./patch-diff.component.less']
})
export class PatchDiffComponent {

  public SheetDiffType = SheetDiffType;

  public ColumnDataType = ColumnDataType;

  public diff$ = this.diffService.getDiff().pipe(
    tap(() => {
      setTimeout(() => {
        this.cd.detectChanges();
      });
    })
  );

  constructor(private diffService: DiffService, private saint: SaintFacade,
              private cd: ChangeDetectorRef) {
  }

  public deleteDefinition(sheetName: string): void {
    this.saint.deleteDefinition(sheetName);
  }

  public deleteAllDefinitions(sheetNames: string[]): void {
    sheetNames.forEach(sheet => {
      this.deleteDefinition(sheet);
    });
  }

  public createDefinition(sheetName: string): void {
    this.saint.createDefinition(sheetName);
  }

  public createAllDefinitions(sheetNames: string[]): void {
    sheetNames.forEach(sheet => {
      this.createDefinition(sheet);
    });
  }

  public getDiffColor(diffType: SheetDiffType): string {
    switch (diffType) {
      case SheetDiffType.ADDED:
        return 'success';
      case SheetDiffType.MODIFIED:
        return 'warning'
      case SheetDiffType.REMOVED:
        return 'error';
    }
  }

  public getDiffIcon(diffType: SheetDiffType): string {
    switch (diffType) {
      case SheetDiffType.ADDED:
        return 'plus';
      case SheetDiffType.MODIFIED:
        return 'edit'
      case SheetDiffType.REMOVED:
        return 'delete';
    }
  }

}
