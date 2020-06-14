import { Timeserieselement } from './timeserieselement';
import { Station } from './station';
import { Field } from './field';

export interface Timeseriescollection{
    station: Station;
    field: Field;
    day: string;
    timeseries: Timeserieselement[];
}