import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { SaintFacade } from '../../../core/saint/+state/saint.facade';
import { KoboldFacade } from '../../../core/kobold/+state/kobold.facade';

@Component({
  selector: 'skysteel-tools-sheet-selector',
  templateUrl: './sheet-selector.component.html',
  styleUrls: ['./sheet-selector.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SheetSelectorComponent {


  @Input()
  loadDataOnSelect = false;

  public sheetFilter$ = new BehaviorSubject('');

  public definitionsList$ = combineLatest([this.saint.availableDefinitions$, this.saint.selectedDefinition$, this.sheetFilter$]).pipe(
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

  constructor(private saint: SaintFacade, private kobold: KoboldFacade) {
    this.saint.loadDefinitionsList();
  }

  public selectDefinition(definition: string): void {
    if (this.loadDataOnSelect) {
      this.kobold.loadSheet(definition);
      this.kobold.selectSheet(definition);
    }
    this.saint.loadDefinition(definition);
    this.saint.selectDefinition(definition);
  }

}
