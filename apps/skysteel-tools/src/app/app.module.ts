import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { CommonModule, registerLocaleData } from '@angular/common';
import { en_US, NZ_I18N } from 'ng-zorro-antd/i18n';
import en from '@angular/common/locales/en';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { IconsProviderModule } from './icons-provider.module';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzNotificationModule } from 'ng-zorro-antd/notification';

registerLocaleData(en);

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    CommonModule,
    
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    IconsProviderModule,
    NzLayoutModule,
    NzMenuModule,
    NzSpinModule,
    FlexLayoutModule,
    NzButtonModule,
    NzNotificationModule
  ],
  bootstrap: [AppComponent],
  providers: [{ provide: NZ_I18N, useValue: en_US }]
})
export class AppModule {
}
