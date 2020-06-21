import { Field } from './field';
import { Station } from './station';

export interface Controllings{
    stations: Station[];
    fields: Field[];
    date: string
  }