import { IpcService } from './service/ipc.service';
import { Kobold } from '@kobold/core';
import { KoboldSheetData } from '../../../libs/models/src/lib/kobold-sheet-data';
import { Excel, Row } from '@kobold/excel';
import { ExcelList } from '@kobold/excel/dist/files';

export class KoboldService {

  private excel: Excel;

  constructor(private ipc: IpcService, private kobold: Kobold) {
    this.excel = new Excel({ kobold });
    this.ipc.on('kobold:sheet:get', async (event, sheetName) => {
      event.sender.send('kobold:sheet', await this.getSheetData(sheetName));
    });
    this.ipc.on('kobold:sheet:list:get', async (event) => {
      event.sender.send('kobold:sheet:list', await this.getSheetsList());
    });
  }

  private buildSheet(sheetName: string) {
    return class extends Row {
      static sheet = sheetName;
      columns = new Array(this.columnsCount)
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

  private async getSheetData(sheetName: string): Promise<KoboldSheetData> {
    try {
      const sheet = await this.excel.getSheet(this.buildSheet(sheetName));
      const rows = await sheet.getRows();
      const content = [];
      for await(const row of rows) {
        content.push({ index: row.index, subIndex: row.subIndex, columns: row.columns });
      }
      return { content };
    } catch (e) {
      console.error(e);
      throw new Error(e.message);
    }
  }
}
