import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolsUpdaterComponent } from './tools-updater/tools-updater.component';
import { RouterModule, Routes } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { FormsModule } from '@angular/forms';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { HttpClientModule } from '@angular/common/http';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { FlexModule } from '@angular/flex-layout';

const routes: Routes = [
  {
    path: '',
    component: ToolsUpdaterComponent
  }
];

@NgModule({
  declarations: [ToolsUpdaterComponent],
  imports: [
    CommonModule,

    RouterModule.forChild(routes),
    FormsModule,
    HttpClientModule,

    NzButtonModule,
    NzDescriptionsModule,
    NzFormModule,
    NzInputModule,
    NzMessageModule,
    NzIconModule,
    NzPageHeaderModule,
    NzStepsModule,
    FlexModule
  ]
})
export class ToolsUpdaterModule {
}
