import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SaintFacade } from '../../../core/saint/+state/saint.facade';
import { KoboldFacade } from '../../../core/kobold/+state/kobold.facade';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { AbstractPageComponent } from '../../../core/abstract-page-component';

@Component({
  selector: 'skysteel-tools-definition-files-organizer',
  templateUrl: './definition-files-organizer.component.html',
  styleUrls: ['./definition-files-organizer.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DefinitionFilesOrganizerComponent extends AbstractPageComponent {

  private combinedSources$ = combineLatest([this.saint.availableDefinitions$, this.kobold.availableSheets$]);

  public missingSheets$ = this.combinedSources$.pipe(
    map(([definitions, sheets]) => {
      console.log(definitions, sheets);
      return definitions.filter(definition => !sheets.includes(definition));
    })
  );

  public missingDefinitions$ = this.combinedSources$.pipe(
    map(([definitions, sheets]) => {
      return sheets.filter(sheet => !definitions.includes(sheet));
    })
  );

  constructor(private saint: SaintFacade, private kobold: KoboldFacade) {
    super();
    this.saint.loadDefinitionsList();
    this.kobold.loadSheetsList();
  }

  public deleteDefinition(sheetName: string): void {
    this.saint.deleteDefinition(sheetName);
  }

  public deleteAllDefinitions(sheetNames: string[]): void {
    sheetNames.forEach(sheet => {
      this.deleteDefinition(sheet);
    });
  }

  public createDefinition(sheetName: string): void {
    this.saint.createDefinition(sheetName);
  }

  public createAllDefinitions(sheetNames: string[]): void {
    sheetNames.forEach(sheet => {
      this.createDefinition(sheet);
    });
  }

}
