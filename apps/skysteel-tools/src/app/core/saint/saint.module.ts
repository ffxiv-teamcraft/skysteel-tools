import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import * as fromSaint from './+state/saint.reducer';
import { SaintEffects } from './+state/saint.effects';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    StoreModule.forFeature(fromSaint.SAINT_FEATURE_KEY, fromSaint.reducer),
    EffectsModule.forFeature([SaintEffects]),
  ],
})
export class SaintModule { }
