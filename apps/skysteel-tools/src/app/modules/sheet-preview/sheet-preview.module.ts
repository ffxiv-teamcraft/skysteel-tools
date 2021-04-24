import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SheetPreviewComponent } from './sheet-preview/sheet-preview.component';
import { NzTableModule } from 'ng-zorro-antd/table';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NzTagModule } from 'ng-zorro-antd/tag';


@NgModule({
  declarations: [
    SheetPreviewComponent
  ],
  imports: [
    CommonModule,
    NzTableModule,
    FlexLayoutModule,
    NzTagModule
  ],
  exports: [
    SheetPreviewComponent
  ]
})
export class SheetPreviewModule {
}
