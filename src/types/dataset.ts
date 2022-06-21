import { Color } from '@/types/colors';

export interface DatasetValueObject<T extends number | Array<number> = number> {
  value: T;
  color?: Color;
}

export type DatasetValue = number | DatasetValueObject | null;

export interface Dataset<T> {
  values: Array<T>;
  color?: Color;
  label?: string;
  areaColor?: Color;
  legend?: string;
}

export type Data<T extends DatasetValue = DatasetValue> = Array<Dataset<T>>;