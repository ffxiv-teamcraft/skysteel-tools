import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import * as fromKobold from './+state/kobold.reducer';
import { KoboldEffects } from './+state/kobold.effects';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    StoreModule.forFeature(fromKobold.KOBOLD_FEATURE_KEY, fromKobold.reducer),
    EffectsModule.forFeature([KoboldEffects]),
  ],
})
export class KoboldModule { }
