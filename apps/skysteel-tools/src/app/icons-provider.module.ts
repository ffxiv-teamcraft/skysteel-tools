import { NgModule } from '@angular/core';
import { NZ_ICONS, NzIconModule } from 'ng-zorro-antd/icon';

import { DeleteOutline, EditOutline, FileAddOutline, InboxOutline, SwapOutline } from '@ant-design/icons-angular/icons';

const icons = [EditOutline, SwapOutline, InboxOutline, DeleteOutline, FileAddOutline];

@NgModule({
  imports: [NzIconModule],
  exports: [NzIconModule],
  providers: [
    { provide: NZ_ICONS, useValue: icons }
  ]
})
export class IconsProviderModule {
}
