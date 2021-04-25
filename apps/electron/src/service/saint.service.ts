import { accessSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from 'fs';
import { extname, join } from 'path';
import { SaintDefinition } from '@skysteel-tools/models';
import { Store } from '../store';
import { IpcService } from './ipc.service';
import { BrowserWindow, dialog, OpenDialogOptions } from 'electron';

export class SaintService {

  private path: string = '';

  constructor(private ipc: IpcService, private store: Store, private win: BrowserWindow) {
    const definitionsPath = store.get('saint:definitions:path', '');
    if (definitionsPath.length > 0) {
      this.setDefinitionsDirectory(definitionsPath);
    }
    this.ipc.on('saint:path:get', (event) => {
      event.sender.send(`saint:path()`, store.get('saint:definitions:path', ''));
    });
    this.ipc.twoWayBinding<string>('saint:definitions', 'saint:definitions:path', (value) => {
      this.setDefinitionsDirectory(value);
    }, '');
    this.ipc.on('saint:definition:get', (event, sheetName) => {
      event.sender.send(`saint:definition(${sheetName})`, this.getDefinition(sheetName));
    });
    this.ipc.on('saint:definition:create', (event, sheetName) => {
      event.sender.send(`saint:definition(${sheetName})`, this.createDefinition(sheetName));
      event.sender.send('saint:definitions:list', this.getDefinitionsList());
    });
    this.ipc.on('saint:definitions:list:get', (event) => {
      event.sender.send('saint:definitions:list()', this.getDefinitionsList());
    });
    this.ipc.on('saint:definition:update', (event, definition: SaintDefinition) => {
      event.sender.send('saint:definition', this.updateDefinition(definition));
    });
    this.ipc.on('saint:definition:delete', (event, sheetName) => {
      this.deleteDefinition(sheetName);
      event.sender.send('saint:definitions:list', this.getDefinitionsList());
    });
    this.ipc.on('saint:path:pick', (event) => {
      const folderPickerOptions: OpenDialogOptions = {
        properties: ['openDirectory']
      };
      dialog.showOpenDialog(this.win, folderPickerOptions).then((result) => {
        if (result.canceled) {
          return;
        }
        const filePath = result.filePaths[0];
        this.setDefinitionsDirectory(filePath);
        event.sender.send('saint:path()', filePath);
        store.set('saint:definitions:path', filePath);
      });
    });
  }

  private setDefinitionsDirectory(path: string): void {
    try {
      // Just check that Achievement sheet Definition exists
      accessSync(join(path, 'Achievement.json'));
      this.path = path;
    } catch (e) {
      this.win.webContents.send('saint:path', '');
      throw new Error('Wrong Saint Definitions path, it should point to the folder containing definition files (or Achievement.json is missing).');
    }
  }

  private getDefinitionsList(): string[] {
    try {
      const files = readdirSync(this.path);
      return files.filter(file => extname(file) === '.json').map(file => file.replace('.json', ''));
    } catch (e) {
      throw new Error('Wrong Saint Definitions path, it should point to the folder containing definition files (or Achievement.json is missing).');
    }
  }

  private getDefinition(sheetName: string): SaintDefinition {
    const raw = readFileSync(join(this.path, `${sheetName}.json`), 'utf8');
    return JSON.parse(raw) as SaintDefinition;
  }

  private createDefinition(sheetName: string): SaintDefinition {
    try {
      const emptySheet: SaintDefinition = {
        sheet: sheetName,
        definitions: []
      };
      writeFileSync(join(this.path, `${sheetName}.json`), JSON.stringify(emptySheet, null, 2),
        { encoding: 'utf8', flag: 'wx' });
      return emptySheet;
    } catch (e) {
      throw new Error(`Definition ${sheetName}.json already exists`);
    }
  }

  private updateDefinition(definition: SaintDefinition): SaintDefinition {
    try {
      writeFileSync(join(this.path, `${definition.sheet}.json`), JSON.stringify(definition, null, 2),
        { encoding: 'utf8', flag: 'w' });
      return definition;
    } catch (e) {
      throw new Error(`Definition ${definition.sheet}.json not found`);
    }
  }

  private deleteDefinition(sheetName: string): void {
    try {
      unlinkSync(join(this.path, `${sheetName}.json`));
    } catch (e) {
      throw new Error(`Definition ${sheetName}.json not found`);
    }
  }
}
