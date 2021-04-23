import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExplorerComponent } from './explorer/explorer.component';
import { RouterModule, Routes } from '@angular/router';
import { SaintModule } from '../../core/saint/saint.module';
import { KoboldModule } from '../../core/kobold/kobold.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { FormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { SheetSelectorModule } from '../../modules/sheet-selector/sheet-selector.module';

const routes: Routes = [
  {
    path: '',
    component: ExplorerComponent
  },
  {
    path: ':sheet',
    component: ExplorerComponent
  },
  {
    path: ':sheet/:row',
    component: ExplorerComponent
  }
];

@NgModule({
  declarations: [
    ExplorerComponent
  ],
  imports: [
    CommonModule,

    SaintModule,
    KoboldModule,

    RouterModule.forChild(routes),
    FlexLayoutModule,
    NzEmptyModule,
    NzPageHeaderModule,
    FormsModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule,
    NzToolTipModule,
    NzTableModule,
    NzDividerModule,
    SheetSelectorModule
  ]
})
export class ExplorerModule {
}
