import { accessSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from 'fs';
import { extname, join } from 'path';
import { SaintDefinition } from '@skysteel-tools/models';
import { Store } from './store';
import { IpcService } from './service/ipc.service';

export class SaintService {

  private path: string = 'G:\\WebstormProjects\\SaintCoinach\\SaintCoinach\\Definitions';

  constructor(private ipc: IpcService, private store: Store) {
    const definitionsPath = store.get('saint:definitions:path', '');
    if (definitionsPath.length > 0) {
      this.setDefinitionsDirectory(definitionsPath);
    }
    this.ipc.twoWayBinding<string>('saint:definitions', 'saint:definitions:path', (value) => {
      this.setDefinitionsDirectory(value);
    }, '');
    this.ipc.on('saint:definition:get', (event, sheetName) => {
      event.sender.send('saint:definition', this.getDefinition(sheetName));
    });
    this.ipc.on('saint:definition:create', (event, sheetName) => {
      event.sender.send('saint:definition', this.createDefinition(sheetName));
      event.sender.send('saint:definitions:list', this.getDefinitionsList());
    });
    this.ipc.on('saint:definitions:list:get', (event) => {
      event.sender.send('saint:definitions:list', this.getDefinitionsList());
    });
    this.ipc.on('saint:definition:update', (event, definition: SaintDefinition) => {
      event.sender.send('saint:definition', this.updateDefinition(definition));
    });
    this.ipc.on('saint:definition:delete', (event, sheetName) => {
      this.deleteDefinition(sheetName);
      event.sender.send('saint:definitions:list', this.getDefinitionsList());
    });
  }

  private setDefinitionsDirectory(path: string): void {
    try {
      // Just check that Achievement sheet Definition exists
      accessSync(join(path, 'Achievement.json'));
      this.path = path;
    } catch (e) {
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
    try {
      const raw = readFileSync(join(this.path, `${sheetName}.json`), 'utf8');
      return JSON.parse(raw) as SaintDefinition;
    } catch (e) {
      throw new Error(`Missing sheet definition for ${sheetName}`);
    }
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
