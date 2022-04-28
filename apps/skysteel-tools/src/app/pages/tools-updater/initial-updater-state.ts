import { Step } from "./step";

export interface UpdaterState {
  running: boolean;
  steps: Step[];
}

export const initialUpdaterState: UpdaterState = {
  running: false,
  steps: [
    {
      id: 'lgb',
      title: 'Update LGB Files',
      status: 'wait'
    },
    {
      id: 'sc:local:update',
      title: 'Update Local SaintCoinach',
      status: 'wait'
    },
    {
      id: 'sc:local:allrawexd',
      title: 'Extract allrawexd',
      status: 'wait'
    },
    {
      id: 'sc:local:ui',
      title: 'Extract ui',
      status: 'wait'
    },
    {
      id: 'sc:local:uiHD',
      title: 'Extract ui HD',
      status: 'wait'
    },
    {
      id: 'sc:local:maps',
      title: 'Extract ui maps',
      status: 'wait'
    },
    {
      id: 'xivapi:datamining-patches',
      title: 'Update patches repo',
      status: 'wait'
    },
    {
      id: 'raw-exd-upload',
      title: 'Send raw-exd-all to the server',
      status: 'wait'
    },
    {
      id: 'xivapi:run-updater',
      title: 'Update data on XIVAPI Server',
      status: 'wait'
    }
  ]
}
