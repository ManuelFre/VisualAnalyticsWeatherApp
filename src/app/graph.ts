import { Field } from './field';

export interface Graph{
    field: Field
    data: [{
        x: number[],
        y: number[],
        type: string, 
        mode: string, 
        name: string, 
        marker: {color: string} 
    }],
    layout: {/*width: 1500, height: 500,*/margin:0, title: string},
  }