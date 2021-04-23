import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatchDiffComponent } from './patch-diff/patch-diff.component';
import { SaintModule } from '../../core/saint/saint.module';
import { KoboldModule } from '../../core/kobold/kobold.module';
import { RouterModule, Routes } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTagModule } from 'ng-zorro-antd/tag';

const routes: Routes = [
  {
    path: '',
    component: PatchDiffComponent
  }
];

@NgModule({
  declarations: [
    PatchDiffComponent
  ],
  imports: [
    CommonModule,

    SaintModule,
    KoboldModule,

    RouterModule.forChild(routes),
    FlexLayoutModule,
    NzEmptyModule,
    NzPageHeaderModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule,
    NzToolTipModule,
    NzDividerModule,
    NzSpinModule,
    NzCardModule,
    NzTagModule
  ]
})
export class PatchDiffModule {
}
