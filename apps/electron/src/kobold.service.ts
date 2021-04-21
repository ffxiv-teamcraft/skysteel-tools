import { IpcService } from './service/ipc.service';
import { Kobold } from '@kobold/core';
import { ExcelList } from '@kobold/excel/dist/files';

export class KoboldService {

  constructor(private ipc: IpcService, private kobold: Kobold) {
    // this.ipc.on('kobold:sheet:get', (event, sheetName) => {
    //   event.sender.send('kobold:sheet', this.getSheetData(sheetName));
    // });
    this.ipc.on('kobold:sheet:list:get', async (event) => {
      event.sender.send('kobold:sheet:list', await this.getSheetsList());
    });
  }

  // private buildSheet(sheetName: string) {
  //   return class extends Row {
  //     static sheet = sheetName;
  //   };
  // }

  private async getSheetsList(): Promise<string[]> {
    try {
      const list = await this.kobold.getFile('exd/root.exl', ExcelList);
      return Array.from(list.sheets.keys()).filter(sheet => !sheet.includes('/'));
    } catch (e) {
      throw new Error('exd/root.exl file not found');
    }
  }

  // private getSheetData(sheetName: string): SaintDefinition {
  //   try {
  //     const raw = readFileSync(join(this.path, `${sheetName}.json`), 'utf8');
  //     return JSON.parse(raw) as SaintDefinition;
  //   } catch (e) {
  //     throw new Error(`Missing sheet definition for ${sheetName}`);
  //   }
  // }
}
