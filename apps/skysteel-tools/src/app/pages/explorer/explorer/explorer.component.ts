import { Component } from '@angular/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { SaintFacade } from '../../../saint/+state/saint.facade';

@Component({
  selector: 'skysteel-tools-explorer',
  templateUrl: './explorer.component.html',
  styleUrls: ['./explorer.component.less']
})
export class ExplorerComponent {

  public sheetFilter$ = new BehaviorSubject('');

  public definitionsList$ = combineLatest([this.saintFacade.availableDefinitions$, this.saintFacade.selectedDefinition$, this.sheetFilter$]).pipe(
    map(([definitions, selectedDefinition, filter]) => {
      return definitions
        .filter(definition => definition.toLowerCase().includes(filter.toLowerCase()))
        .map(definition => {
          return {
            sheet: definition,
            selected: selectedDefinition?.sheet === definition
          };
        });
    })
  );

  public selectedDefinition$ = this.saintFacade.selectedDefinition$;

  constructor(private saintFacade: SaintFacade) {
    this.saintFacade.loadDefinitionsList();
  }

  public selectDefinition(definition: string): void {
    this.saintFacade.loadDefinition(definition);
    this.saintFacade.selectDefinition(definition);
  }

}
