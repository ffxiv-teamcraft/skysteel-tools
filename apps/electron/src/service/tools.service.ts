import { IpcService } from './ipc.service';
import { Store } from '../store';
import { BrowserWindow } from 'electron';
import { NodeSSH } from 'node-ssh';
import { join } from 'path';
import { exec, execFile, spawn } from 'child_process';
import { copySync, moveSync, removeSync } from 'fs-extra';
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import * as AdmZip from 'adm-zip';
import { of } from 'rxjs';

export class ToolsService {

  static XIVAPI_SSH: NodeSSH;

  private newPatch = null;

  PATHS = {
    XIVAPI_HOME: '',
    DALAMUD_SYMFONY_CONSOLE: '',
    XIVAPI_LOCAL: 'H:\\WebstormProjects\\xivapi.com',
    SAINT_MAPS: 'H:\\WebstormProjects\\SaintVekien',
    LGB_TO_JSON: 'H:\\WebstormProjects\\LGBToJson\\bin\\x64\\Debug\\net6.0',
    TEAMCRAFT: 'H:\\WebstormProjects\\ffxiv-teamcraft',
    GAME: 'H:\\SquareEnix\\FINAL FANTASY XIV - A Realm Reborn'
  };

  private xivapiCreds = {
    username: '',
    password: ''
  };

  constructor(private ipc: IpcService, private store: Store, private win: BrowserWindow) {
    win.on('close', () => {
      ToolsService.XIVAPI_SSH?.dispose();
    });

    ipc.on('XIVAPI:SSH:connect', (event, { username, password }) => {
      this.connectXIVAPI(username, password).then(() => {
        event.sender.send('XIVAPI:SSH:connect:res', 1);
        this.PATHS.XIVAPI_HOME = `/home/${username}/xivapi.com`;
        this.PATHS.DALAMUD_SYMFONY_CONSOLE = `/home/${username}/xivapi.com/bin/console`;
      }).catch(err => {
        event.sender.send('XIVAPI:SSH:connect:res', err);
      });
    });

    this.buildListener('UPDATE:LGB:Extract', (reply) => {
      removeSync(join(this.PATHS.LGB_TO_JSON, 'out'));
      const child = execFile(join(this.PATHS.LGB_TO_JSON, 'LGBToJson.exe'), {
        cwd: this.PATHS.LGB_TO_JSON
      });
      child.on('close', () => {
        removeSync(join(this.PATHS.TEAMCRAFT, 'apps/data-extraction/input/lgb'));
        moveSync(join(this.PATHS.LGB_TO_JSON, 'out'), join(this.PATHS.TEAMCRAFT, 'apps/data-extraction/input/lgb'));
        reply();
      });
    });

    this.buildListener('UPDATE:SC:LOCAL', (reply) => {
      const child = exec('php bin/console SaintCoinachDownloadCommand', { cwd: this.PATHS.XIVAPI_LOCAL });
      child.on('close', () => {
        reply();
      });
    });

    this.buildListener('GAME:version', reply => {
      const gamever = readFileSync(join(this.PATHS.GAME, 'game/ffxivgame.ver'), 'utf-8');
      reply(gamever);
    });

    this.buildListener('SC:gamever', reply => {
      const gamever = readFileSync(join(this.PATHS.XIVAPI_LOCAL, 'data/SaintCoinach.Cmd/Definitions/game.ver'), 'utf-8');
      reply(gamever);
    });

    this.buildListenerWithOutput('UPDATE:SC:allrawexd', (reply, stdout) => {
      const child = spawn(join(this.PATHS.XIVAPI_LOCAL, 'data\\SaintCoinach.Cmd\\extract-allrawexd.bat'),
        {
          cwd: join(this.PATHS.XIVAPI_LOCAL, 'data\\SaintCoinach.Cmd'),
          shell: true
        });

      child.stdout.on('data', (data) => {
        stdout(data.toString());
      });

      child.on('exit', () => {
        reply();
      });
    });

    this.buildListener('UPDATE:SC:uiHD', (reply) => {
      const child = spawn(join(this.PATHS.XIVAPI_LOCAL, 'data\\SaintCoinach.Cmd\\extract-uiHD.bat'),
        {
          cwd: join(this.PATHS.XIVAPI_LOCAL, 'data\\SaintCoinach.Cmd'),
          shell: true
        });

      child.on('exit', () => {
        reply();
      });
    });

    this.buildListener('UPDATE:SC:ui', (reply) => {
      const child = spawn(join(this.PATHS.XIVAPI_LOCAL, 'data\\SaintCoinach.Cmd\\extract-ui.bat'),
        {
          cwd: join(this.PATHS.XIVAPI_LOCAL, 'data\\SaintCoinach.Cmd'),
          shell: true
        });

      child.on('exit', () => {
        reply();
      });
    });

    this.buildListener('UPDATE:SC:maps', (reply) => {
      const child = spawn(join(this.PATHS.SAINT_MAPS, 'extract-maps.bat'),
        {
          cwd: this.PATHS.SAINT_MAPS,
          shell: true
        });
      child.stdout.on('data', (data) => {
        if (data.toString().includes('Y/n')) {
          child.stdin.write('n');
          child.stdin.end();
        }
      });

      child.on('exit', () => {
        reply();
      });
    });

    this.buildListener('filezilla:open', (e, type) => {
      const gamever = readFileSync(join(this.PATHS.GAME, 'game/ffxivgame.ver'), 'utf-8');
      let remotePath, localPath;
      switch (type) {
        case 'ICONS':
          localPath = join(this.PATHS.XIVAPI_LOCAL, 'data/SaintCoinach.Cmd', gamever, 'ui/icon');
          remotePath = `${this.PATHS.XIVAPI_HOME}/public/i/`;
          break;
        case 'MAPS':
          localPath = join(this.PATHS.SAINT_MAPS, gamever, 'ui/map');
          remotePath = `${this.PATHS.XIVAPI_HOME}/public/m/`;
          break;
      }
      this.openFilezilla(remotePath, localPath);
    });

    this.buildListener('UPDATE:addPatchEntry', (reply, version) => {
      const patchesPath = join(this.PATHS.XIVAPI_LOCAL, 'src\\Service\\GamePatch\\resources', 'patchlist.json');
      const patchesStr = readFileSync(patchesPath, 'utf-8');
      const patches = JSON.parse(patchesStr);
      const lastPatch = patches[patches.length - 1];
      const releaseDate = new Date();
      releaseDate.setUTCHours(10);
      releaseDate.setUTCMinutes(0);
      releaseDate.setUTCSeconds(0);
      const newPatch = {
        Banner: null,
        ID: lastPatch.ID + 1,
        Url: `\/patch+${version}`,
        ExVersion: 4,
        ExName: 'Endwalker',
        IsExpansion: false,
        Name_ja: `Patch ${version}`,
        Name_en: `Patch ${version}`,
        Name_fr: `Patch ${version}`,
        Name_de: `Patch ${version}`,
        Name_cn: `Patch ${version}`,
        Name_kr: `Patch ${version}`,
        PatchNotes_de: '',
        PatchNotes_en: '',
        PatchNotes_fr: '',
        PatchNotes_ja: '',
        ReleaseDate: Math.floor(releaseDate.getTime() / 1000),
        Version: version
      };
      this.newPatch = newPatch;
      patches.push(newPatch);
      writeFileSync(patchesPath, JSON.stringify(patches, null, 4));
      reply();
    });

    this.buildListener('UPDATE:patches-repo', (reply) => {
      if (!this.newPatch) {
        throw new Error('Do not run patches repo updater without running new patch first.');
      }
      const ffxivgamever = readFileSync(join(this.PATHS.GAME, 'game/ffxivgame.ver'), 'utf-8');
      copySync(
        join(this.PATHS.XIVAPI_LOCAL, 'data/SaintCoinach.Cmd/', ffxivgamever, 'raw-exd-all'),
        join(this.PATHS.XIVAPI_LOCAL, 'data/ffxiv-datamining-patches/extracts/', this.newPatch.Version),
        { recursive: true }
      );

      const cleanupPHPPath = join(this.PATHS.XIVAPI_LOCAL, 'data/ffxiv-datamining-patches/', 'cleanup.php');
      const cleanupPHP = readFileSync(cleanupPHPPath, 'utf-8');
      const updatedCleanupPHP = cleanupPHP.replace(/\/extracts\/\d+\.\d+/gmi, `/extracts/${this.newPatch.Version}`);
      writeFileSync(cleanupPHPPath, updatedCleanupPHP);

      const buildPHPPath = join(this.PATHS.XIVAPI_LOCAL, 'data/ffxiv-datamining-patches/', 'build.php');
      const buildPHP = readFileSync(buildPHPPath, 'utf-8');
      const buildPHPAsArray = buildPHP.split('\n');
      buildPHPAsArray.splice(232, 0, buildPHPAsArray[187]);
      buildPHPAsArray[187] = buildPHPAsArray[187]
        .replace((this.newPatch.ID - 1).toString(), this.newPatch.ID)
        .replace(/\/extracts\/\d+\.\d+/gm, `/extracts/${this.newPatch.Version}`)
        .replace(/'\d+\.\d+'/gm, `'${this.newPatch.Version}'`);
      const updatedBuildPHP = buildPHPAsArray.join('\n');
      writeFileSync(buildPHPPath, updatedBuildPHP);

      reply();
    });

    this.buildListener('UPDATE:build-patches', (reply, version) => {
      const dataminingPatchesRepo = join(this.PATHS.XIVAPI_LOCAL, 'data/ffxiv-datamining-patches/');
      const cleanup = exec(`php ${join(dataminingPatchesRepo, 'cleanup.php')}`, { cwd: dataminingPatchesRepo });
      cleanup.on('close', () => {
        const build = exec(`php ${join(dataminingPatchesRepo, 'build.php')}`, { cwd: dataminingPatchesRepo });
        build.on('close', () => {
          const git = exec(`git add *.json && git add *.php && git commit -m "Patch ${version}" && git push`,
            { cwd: dataminingPatchesRepo });
          setTimeout(() => {
            git.kill();
            reply();
          }, 10000);
          git.on('close', () => reply());
          git.on('exit', () => reply());
        });
      });
    });

    this.buildListenerWithOutput('UPDATE:send-exd-zip', async (reply, stdout) => {
      stdout('Creating ZIP file');
      const ffxivgamever = readFileSync(join(this.PATHS.GAME, 'game/ffxivgame.ver'), 'utf-8');
      const zip = new AdmZip();
      removeSync(join(this.PATHS.XIVAPI_LOCAL, 'data/SaintCoinach.Cmd/', ffxivgamever, 'raw-exd-all.zip'));
      zip.addLocalFolder(join(this.PATHS.XIVAPI_LOCAL, 'data/SaintCoinach.Cmd/', ffxivgamever, 'raw-exd-all'), 'raw-exd-all');
      zip.writeZip(join(this.PATHS.XIVAPI_LOCAL, 'data/SaintCoinach.Cmd/', ffxivgamever, 'raw-exd-all.zip'));

      stdout('Updating remote SaintCoinach');
      await ToolsService.XIVAPI_SSH.exec(`php`, [this.PATHS.DALAMUD_SYMFONY_CONSOLE, 'SaintCoinachDownloadCommand'],
        {
          stream: 'both'
        });

      stdout('Updating datamining repo');
      await ToolsService.XIVAPI_SSH.exec(`cd ${this.PATHS.XIVAPI_HOME}/data/ffxiv-datamining-patches && git pull`, [], {
        stream: 'both'
      });

      stdout('Deleting previous version folder');
      await ToolsService.XIVAPI_SSH.exec('rm', ['-r', `${this.PATHS.XIVAPI_HOME}/data/SaintCoinach.Cmd/202*`], {
        stream: 'both'
      });

      stdout('Creating new version folder');
      await ToolsService.XIVAPI_SSH.exec('mkdir', [`${this.PATHS.XIVAPI_HOME}/data/SaintCoinach.Cmd/${ffxivgamever}`]);

      stdout('Uploading ZIP file');
      await ToolsService.XIVAPI_SSH.putFile(
        join(this.PATHS.XIVAPI_LOCAL, 'data/SaintCoinach.Cmd/', ffxivgamever, 'raw-exd-all.zip'),
        `${this.PATHS.XIVAPI_HOME}/data/SaintCoinach.Cmd/${ffxivgamever}/raw-exd-all.zip`);

      stdout('Extracting ZIP file');
      await ToolsService.XIVAPI_SSH.exec('unzip',
        [`${this.PATHS.XIVAPI_HOME}/data/SaintCoinach.Cmd/${ffxivgamever}/raw-exd-all.zip`],
        { cwd: `${this.PATHS.XIVAPI_HOME}/data/SaintCoinach.Cmd/${ffxivgamever}/` });

      reply();
    });

    this.buildListenerWithOutput('XIVAPI:SSH:run-updater', async (reply, stdout) => {
      stdout('Updating JSON cache');
      await ToolsService.XIVAPI_SSH.exec(`php`, [this.PATHS.DALAMUD_SYMFONY_CONSOLE, 'SaintCoinachJsonCacheCommand'], { stream: 'both' });

      const definitionsPath = join(this.PATHS.XIVAPI_LOCAL, 'data/SaintCoinach.Cmd/Definitions');
      const allDefinitions = readdirSync(definitionsPath)
        .filter(file => file.endsWith('.json'))
        .filter(file => {
          return JSON.parse(readFileSync(join(definitionsPath, file), 'utf-8')).definitions.length > 0;
        })
        .map(file => file.replace('.json', ''))
        .filter(def => {
          return ![
            'Level',
            'HWDIntroduction'
          ].includes(def);
        });

      const WORKERS_POOL_SIZE = 5;

      let done = 0;
      const todo = allDefinitions.length;
      let workers = [];

      // from(allDefinitions).pipe(
      //   mergeMap((definition) => {
      //     workers.push(definition);
      //     stdout({
      //       done,
      //       todo,
      //       workers
      //     });
      //     return defer(() => from(
      //       ToolsService.XIVAPI_SSH.exec(`php`,
      //         [this.PATHS.DALAMUD_SYMFONY_CONSOLE, 'SaintCoinachRedisCommand', `--content=${definition}`, '-q'],
      //         {
      //           cwd: this.PATHS.XIVAPI_HOME,
      //           stream: 'both',
      //           onStderr: (out) => console.log('ERR:', out.toString())
      //         })
      //     )).pipe(
      //       map(() => {
      //         done++;
      //         workers = workers.filter(w => w !== definition);
      //         stdout({
      //           done,
      //           todo,
      //           workers
      //         });
      //       })
      //     );
      //   }, WORKERS_POOL_SIZE),
      //   last()
      // )

      of(1).subscribe(async () => {
        const customRunners = readdirSync(join(this.PATHS.XIVAPI_LOCAL, 'src/Service/DataCustom'));
        const runnersToRun = customRunners
          .filter(file => file.endsWith('.php'))
          .map(file => {
            const priority = /PRIORITY = (\d+);/gm.exec(readFileSync(join(this.PATHS.XIVAPI_LOCAL, 'src/Service/DataCustom/', file), 'utf-8'));
            return {
              file,
              priority: +priority[1]
            };
          })
          .sort((a, b) => a.priority - b.priority)
          .map(({ file }) => file.replace('.php', ''));
        let customDone = 0;
        for (let content of runnersToRun) {
          stdout({
            todo: runnersToRun.length,
            done: customDone,
            sheet: `Running custom importers (${content})`
          });
          await ToolsService.XIVAPI_SSH.exec(`php`,
            [this.PATHS.DALAMUD_SYMFONY_CONSOLE, 'SaintCoinachRedisCustomCommand', content],
            {
              cwd: this.PATHS.XIVAPI_HOME,
              stream: 'both'
            });
          customDone++;
        }

        stdout('Building character data');
        await ToolsService.XIVAPI_SSH.exec(`php`,
          [this.PATHS.DALAMUD_SYMFONY_CONSOLE, 'BuildCharacterData'],
          {
            cwd: this.PATHS.XIVAPI_HOME,
            stream: 'both'
          });

        stdout('Updating search');
        await ToolsService.XIVAPI_SSH.exec(`php`,
          [this.PATHS.DALAMUD_SYMFONY_CONSOLE, 'UpdateSearchCommand', '--environment=prod'],
          {
            cwd: this.PATHS.XIVAPI_HOME,
            stream: 'both'
          });
        await ToolsService.XIVAPI_SSH.exec(`php`,
          [this.PATHS.DALAMUD_SYMFONY_CONSOLE, 'UpdateSearchLoreCommand'],
          {
            cwd: this.PATHS.XIVAPI_HOME,
            stream: 'both'
          });

        reply();
      });
    });
  }

  private buildListenerWithOutput(channel: string, cb: (reply: (data?: any) => void, stdout: (output: any) => void, ...args: any[]) => void): void {
    this.ipc.on(channel, (event, args) => {
      const reply = (data: any) => {
        event.sender.send(`${channel}:res`, data);
      };
      const stdout = (data: any) => {
        event.sender.send(`${channel}:stdout`, data);
      };
      cb(reply, stdout, args);
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
    ToolsService.XIVAPI_SSH = await this.newSSHConnection(username, password);
  }

  async newSSHConnection(username: string, password: string) {
    const ssh = new NodeSSH();
    return await ssh.connect({
      host: '51.83.37.191',
      username,
      password
    }).then(ssh => {
      ssh.exec('cd', [this.PATHS.XIVAPI_HOME]);
      this.xivapiCreds = {
        username,
        password
      };
      return ssh;
    });
  }

  openFilezilla(remotePath: string, localPath: string): void {
    execFile(`C:\\Program Files\\FileZilla FTP Client\\filezilla.exe`, [
      `${this.xivapiCreds.username}:${this.xivapiCreds.password}@51.83.37.191:22${remotePath}`,
      `--local=${localPath}`
    ]);
  }
}

