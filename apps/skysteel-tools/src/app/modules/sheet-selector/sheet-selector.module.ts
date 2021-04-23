import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SheetSelectorComponent } from './sheet-selector/sheet-selector.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NzInputModule } from 'ng-zorro-antd/input';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    SheetSelectorComponent
  ],
  exports: [
    SheetSelectorComponent
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    NzInputModule,
    FormsModule
  ]
})
export class SheetSelectorModule { }
