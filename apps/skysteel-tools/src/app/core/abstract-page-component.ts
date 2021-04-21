import { Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
  template: ''
})
export abstract class AbstractPageComponent implements OnDestroy {
  protected onDestroy$ = new Subject<void>();
  public canGoBack = window.history.length > 0;


  back(): void {
    window.history.back();
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

}
