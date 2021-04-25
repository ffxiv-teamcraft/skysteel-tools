import { accessSync, readFileSync } from 'fs';
import { join } from 'path';
import { Store } from '../store';
import { IpcService } from './ipc.service';
import { BrowserWindow, dialog, OpenDialogOptions } from 'electron';

export class CsvService {

  private path = '';

  constructor(private ipc: IpcService, private store: Store, private win: BrowserWindow) {
    this.ipc.on('csv:sheet:get', (event, sheetName) => {
      if (this.store.get('csv:sheets:path', '') === '') {
        throw new Error('Please set path to extracts before trying to get a CSV file');
      }

      try {
        event.sender.send(`csv:sheet(${sheetName})`, this.getCSV(sheetName));
      } catch (e) {
        event.sender.send(`csv:sheet(${sheetName})`, []);
      }
    });
    this.ipc.on('csv:path:pick', (event) => {
      const folderPickerOptions: OpenDialogOptions = {
        properties: ['openDirectory']
      };
      dialog.showOpenDialog(this.win, folderPickerOptions).then((result) => {
        if (result.canceled) {
          return;
        }
        const filePath = result.filePaths[0];
        try {
          this.setPath(filePath);
        } catch (e) {
          event.sender.send('error', e);
        }
      });
    });
  }

  private setPath(path: string): void {
    try {
      // Just check that Achievement csv is here
      accessSync(join(path, 'Achievement.csv'));
      this.path = path;
      this.win.webContents.send('csv:path()', path);
    } catch (e) {
      throw new Error('Wrong raw-exd path, it should point to a folder where *.csv sheets (like Achievement.csv for instance) are, without language suffixes.');
    }
  }

  CSVToArray(strData: string, maxLength: number): string[][] {
    const objPattern = new RegExp(
      (
        // Delimiters.
        '(\\,|\\r?\\n|\\r|^)' +
        // Quoted fields.
        '(?:"([^"]*(?:""[^"]*)*)"|' +
        // Standard fields.
        '([^"\\,\\r\\n]*))'
      ),
      'gi'
    );
    // Create an array to hold our data. Give the array
    // a default empty first row.
    const arrData = [[]];

    // Create an array to hold our individual pattern
    // matching groups.
    let arrMatches = null;


    // Keep looping over the regular expression matches
    // until we can no longer find a match.
    while (arrMatches = objPattern.exec(strData)) {

      // Get the delimiter that was found.
      const strMatchedDelimiter = arrMatches[1];

      // Check to see if the given delimiter has a length
      // (is not the start of string) and if it matches
      // field delimiter. If id does not, then we know
      // that this delimiter is a row delimiter.
      if (
        strMatchedDelimiter.length &&
        strMatchedDelimiter !== ','
      ) {
        if (arrData.length >= maxLength) {
          break;
        }

        // Since we have reached a new row of data,
        // add an empty row to our data array.
        arrData.push([]);

      }

      let strMatchedValue;

      // Now that we have our delimiter out of the way,
      // let's check to see which kind of value we
      // captured (quoted or unquoted).
      if (arrMatches[2]) {

        // We found a quoted value. When we capture
        // this value, unescape any double quotes.
        strMatchedValue = arrMatches[2].replace(
          new RegExp('""', 'g'),
          '"'
        );

      } else {

        // We found a non-quoted value.
        strMatchedValue = arrMatches[3];

      }


      // Now that we have our value string, let's add
      // it to the data array.
      arrData[arrData.length - 1].push(strMatchedValue);
    }

    // Return the parsed data.
    return arrData;
  }

  private getCSV(name: string): string[][] {
    const path = this.path;
    try {
      const data = readFileSync(join(path, `${name}.csv`), 'utf-8');
      // Get only the first 50 rows, will eb enough to figure out if a change happened or not
      // Also removing first column because we don't care about the key
      return this.CSVToArray(data, 50)
        .map(row => row.slice(1))
        .filter(row => row.length > 0);
    } catch (e) {
      throw new Error(`Missing CSV file for sheet ${name} in ${path}`);
    }
  }
}
