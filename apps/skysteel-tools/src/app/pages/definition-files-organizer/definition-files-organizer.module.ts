import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DefinitionFilesOrganizerComponent } from './definition-files-organizer/definition-files-organizer.component';
import { RouterModule, Routes } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { SaintModule } from '../../core/saint/saint.module';
import { KoboldModule } from '../../core/kobold/kobold.module';
import { NzCardModule } from 'ng-zorro-antd/card';

const routes: Routes = [
  {
    path: '',
    component: DefinitionFilesOrganizerComponent
  }
];

@NgModule({
  declarations: [
    DefinitionFilesOrganizerComponent
  ],
  imports: [
    CommonModule,

    SaintModule,
    KoboldModule,

    RouterModule.forChild(routes),
    FlexLayoutModule,
    NzEmptyModule,
    NzPageHeaderModule,
    NzButtonModule,
    NzIconModule,
    NzToolTipModule,
    NzCardModule
  ]
})
export class DefinitionFilesOrganizerModule {
}
