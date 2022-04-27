import { IpcService } from './ipc.service';
import { Store } from '../store';
import { BrowserWindow } from 'electron';
import { NodeSSH } from 'node-ssh';
import { readFileSync, rmdirSync } from 'fs';
import { join } from 'path';
import { execFile } from 'child_process';


const PATHS = {
  XIVAPI_HOME: '/home/dalamud/xivapi.com',
  XIVAPI_LOCAL: 'H:\\WebstormProjects\\xivapi.com',
  LGB_TO_JSON: 'H:\\WebstormProjects\\LGBToJson\\bin\\x64\\Debug\\net6.0'
};

export class ToolsService {

  static XIVAPI_SSH: NodeSSH;

  constructor(private ipc: IpcService, private store: Store, private win: BrowserWindow) {
    win.on('close', () => {
      ToolsService.XIVAPI_SSH?.dispose();
    });

    ipc.on('XIVAPI:SSH:connect', (event, { username, password }) => {
      this.connectXIVAPI(username, password).then(() => {
        event.sender.send('XIVAPI:SSH:connect:res', 1);
      }).catch(err => {
        event.sender.send('XIVAPI:SSH:connect:res', err);
      });
    });

    this.buildListener('XIVAPI:SC:version', (reply) => {
      reply(readFileSync(join(PATHS.XIVAPI_LOCAL, `/data/SaintCoinach.Cmd/VERSION`), 'utf8'));
    });

    this.buildListener('XIVAPI:SSH:SC-version', (reply) => {
      ToolsService.XIVAPI_SSH.exec('cat', [`${PATHS.XIVAPI_HOME}/data/SaintCoinach.Cmd/VERSION`]).then(res => {
        reply(res);
      });
    });

    this.buildListener('UPDATE:LGB:Extract', (reply) => {
      rmdirSync(join(PATHS.LGB_TO_JSON, 'out'), { recursive: true });
      const child = execFile(join(PATHS.LGB_TO_JSON, 'LGBToJson.exe'), {
        cwd: PATHS.LGB_TO_JSON
      });
      child.on('close', () => {
        reply();
      });
    });
  }

  private buildListener(channel: string, cb: (reply: (data?: any) => void, ...args: any[]) => void): void {
    this.ipc.on(channel, (event, args) => {
      const reply = (data: any) => {
        event.sender.send(`${channel}:res`, data);
      };
      cb(reply, args);
    });
  }

  async connectXIVAPI(username: string, password: string) {
    if (ToolsService.XIVAPI_SSH !== undefined) {
      ToolsService.XIVAPI_SSH.dispose();
    }
    const ssh = new NodeSSH();
    ToolsService.XIVAPI_SSH = await ssh.connect({
      host: '51.83.37.191',
      username,
      password
    }).then(ssh => {
      ssh.exec('cd', [PATHS.XIVAPI_HOME]);
      return ssh;
    });
  }
}
