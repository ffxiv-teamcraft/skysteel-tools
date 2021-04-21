import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExplorerComponent } from './explorer/explorer.component';
import { RouterModule, Routes } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { FormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';

const routes: Routes = [{
  path: '',
  component: ExplorerComponent
}];

@NgModule({
  declarations: [
    ExplorerComponent
  ],
  imports: [
    CommonModule,

    RouterModule.forChild(routes),
    FlexLayoutModule,
    NzEmptyModule,
    NzPageHeaderModule,
    FormsModule,
    NzInputModule
  ]
})
export class ExplorerModule {
}
