import { NgModule } from '@angular/core';
import { NZ_ICONS, NzIconModule } from 'ng-zorro-antd/icon';

import {
  DeleteOutline,
  DiffOutline,
  EditOutline,
  FileAddOutline,
  FileSearchOutline,
  InboxOutline,
  SwapOutline,
  CodeOutline
} from '@ant-design/icons-angular/icons';

const icons = [EditOutline, SwapOutline, DiffOutline, InboxOutline, DeleteOutline, FileAddOutline, FileSearchOutline,
  CodeOutline];

@NgModule({
  imports: [NzIconModule],
  exports: [NzIconModule],
  providers: [
    { provide: NZ_ICONS, useValue: icons }
  ]
})
export class IconsProviderModule {
}
