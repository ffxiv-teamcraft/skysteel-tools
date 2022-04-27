export interface Step {
  id: string;
  title: string;
  description?: string;
  subtitle?: string;
  progress?: number;
  status: 'wait' | 'process' | 'finish' | 'error';
}
