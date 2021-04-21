import { SaintConverter } from './saint-converter';

export interface SaintColumnDefinition {
  index?: number;
  isGenericReferenceTarget?: boolean;
  name: string;
  converter?: SaintConverter;
}
