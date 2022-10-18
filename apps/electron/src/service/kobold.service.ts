import { IpcService } from './ipc.service';
import { Kobold } from '@kobold/core';
import { KoboldSheetData } from '@skysteel-tools/models';
import { Excel, Row } from '@kobold/excel';
import { ExcelList } from '@kobold/excel/dist/files';

export class KoboldService {

  private excel: Excel;

  constructor(private ipc: IpcService, private kobold: Kobold) {
    this.excel = new Excel({ kobold });
    this.ipc.on('kobold:sheet:get', async (event, ...args) => {
      event.sender.send(`kobold:sheet(${args.join(',')})`, await this.getSheetData(args[0], args[1]));
    });
    this.ipc.on('kobold:sheet:list:get', async (event) => {
      event.sender.send('kobold:sheet:list()', await this.getSheetsList());
    });
  }

  private buildSheet(sheetName: string) {
    return class DynamicSheet extends Row {
      static sheet = sheetName;
      // Need to fork kobold/excel to make this work
      columns = new Array(this.sheetHeader.columns.length)
        .fill(null)
        .map((_, i) => {
          return this.unknown({ column: i });
        });
    };
  }

  private async getSheetsList(): Promise<string[]> {
    try {
      const list = await this.kobold.getFile('exd/root.exl', ExcelList);
      return Array.from(list.sheets.keys()).filter(sheet => !sheet.includes('/'));
    } catch (e) {
      console.error(e);
      throw new Error('exd/root.exl file not found');
    }
  }

  private async getSheetData(sheetName: string, length = Infinity): Promise<KoboldSheetData> {
    try {
      const sheet = await this.excel.getSheet(this.buildSheet(sheetName));
      const rows = await sheet.getRows();
      const content = [];
      let counter = 0;
      for await(const row of rows) {
        content.push({ index: row.index, subIndex: row.subIndex, columns: row.columns });
        counter++;
        if (counter >= length) {
          break;
        }
      }
      return { content };
    } catch (e) {
      console.error(e);
      throw new Error(e.message);
    }
  }
}
