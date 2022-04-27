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
    }
  ]
}
