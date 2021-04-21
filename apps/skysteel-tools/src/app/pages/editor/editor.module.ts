import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NgJsonEditorModule } from 'ang-jsoneditor';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { IndexShiftParamsComponent } from './index-shift-params/index-shift-params.component';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { EditorComponent } from './editor/editor.component';
import { SaintModule } from '../../core/saint/saint.module';
import { KoboldModule } from '../../core/kobold/kobold.module';

const routes: Routes = [
  {
    path: '',
    component: EditorComponent
  },
  {
    path: ':sheet',
    component: EditorComponent
  }
];

@NgModule({
  declarations: [
    EditorComponent,
    IndexShiftParamsComponent
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
    NgJsonEditorModule,
    NzButtonModule,
    NzIconModule,
    NzModalModule,
    NzToolTipModule,
    NzFormModule,
    NzSelectModule,
    ReactiveFormsModule
  ]
})
export class EditorModule {
}
