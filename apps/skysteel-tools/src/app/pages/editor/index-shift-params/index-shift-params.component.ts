import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SaintDefinition } from '../../../../../../../libs/models/src';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'skysteel-tools-index-shift-params',
  templateUrl: './index-shift-params.component.html',
  styleUrls: ['./index-shift-params.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IndexShiftParamsComponent {

  @Input()
  definition: SaintDefinition;

  public columnIndex: number;

  public distance = 0;

  constructor(private modalRef: NzModalRef) {
  }

  public submit(): void {
    this.modalRef.close({
      index: this.columnIndex,
      distance: this.distance
    });
  }

}
