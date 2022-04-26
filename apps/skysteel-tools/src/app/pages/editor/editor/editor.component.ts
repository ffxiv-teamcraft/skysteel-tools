import { Component } from '@angular/core';
import { filter, takeUntil } from 'rxjs/operators';
import { JsonEditorOptions } from 'ang-jsoneditor';
import { NzModalService } from 'ng-zorro-antd/modal';
import { SaintDefinition } from '@skysteel-tools/models';
import { IndexShiftParamsComponent } from '../index-shift-params/index-shift-params.component';
import { ActivatedRoute } from '@angular/router';
import { AbstractPageComponent } from '../../../core/abstract-page-component';
import { SaintFacade } from '../../../core/saint/+state/saint.facade';

@Component({
  selector: 'skysteel-tools-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.less']
})
export class EditorComponent extends AbstractPageComponent {

  public selectedDefinition$ = this.saint.selectedDefinition$;

  public editorOptions: JsonEditorOptions;

  constructor(private saint: SaintFacade, private modal: NzModalService,
              private route: ActivatedRoute) {
    super();
    this.route.paramMap.pipe(
      takeUntil(this.onDestroy$)
    ).subscribe(paramMap => {
      const sheetName = paramMap.get('sheet');
      if (sheetName) {
        this.selectDefinition(sheetName);
      }
    });
    this.editorOptions = new JsonEditorOptions();
    this.editorOptions.mode = 'code';
    this.editorOptions.onValidate = (json: any) => {
      const errors = [];
      if (json) {
        if (!json.sheet) {
          errors.push({
            path: [''],
            message: 'Missing Sheet name'
          });
        }
        if (!json.definitions) {
          errors.push({
            path: [''],
            message: 'Missing Definitions property'
          });
        }
      }
      return errors;
    };
    this.editorOptions.mainMenuBar = false;
  }

  public save(definition: SaintDefinition): void {
    this.saint.updateDefinition(definition);
  }

  public selectDefinition(definition: string): void {
    this.saint.loadDefinition(definition);
    this.saint.selectDefinition(definition);
  }

  public indexShift(definition: SaintDefinition): void {
    this.modal.create({
      nzTitle: 'Index shift helper',
      nzContent: IndexShiftParamsComponent,
      nzComponentParams: { definition },
      nzFooter: null
    }).afterClose
      .pipe(
        filter(config => !!config)
      ).subscribe(config => {
      const newDefinition = this.saint.shiftColumn(definition, config.index, config.distance);
      this.saint.updateDefinition(newDefinition);
    });
  }

}
