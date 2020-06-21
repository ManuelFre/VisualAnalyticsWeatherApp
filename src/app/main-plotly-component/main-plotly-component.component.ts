import { Component, OnInit } from '@angular/core';
import { StationsService } from '../stations.service';
import { Station } from '../station';
import { Field } from '../field';
import { FieldsService } from '../field.service';
import { Timeserieselement } from '../timeserieselement';
import { Timeseriescollection } from '../timeseriescollection';
import { TimeseriesService } from '../timeseries.service';
import { PlotlyModule } from 'angular-plotly.js';
import { FormBuilder, FormControl, NgModel } from '@angular/forms';
import { Plotly } from 'angular-plotly.js/src/app/shared/plotly.interface';
import { Controllings} from '../controllings';
//import { Graph } from '../graph';


@Component({
  selector: 'app-main-plotly-component',
  templateUrl: './main-plotly-component.component.html',
  styleUrls: ['./main-plotly-component.component.css'],
  //template: '<plotly-plot [data]="graph.data" [layout]="graph.layout"></plotly-plot>'
})
export class MainPlotlyComponentComponent implements OnInit {
  checkoutForm;
  stations: Station[];
  fields: Field[];
  controllings: Controllings;
  //selectedFields: Field[];
  //selectedStations: Station[];
  timeseriescollections: Timeseriescollection[];
  graphs;
  gauchos;
  choosenSite: String;

  //selectedDate: String;
  

  getStations(): void {
    console.log(`Got Stationrequest`);
    this.stationsService.getStations()
      .subscribe(stations => {
        this.controllings.stations=[(stations[stations.map(function(e) {return e.name;}).indexOf('Wien/Hohe Warte')])] 
        this.stations = stations      //Man subsribed sich auf den Service. Damit ist es trotz synchroner Client-Server Übertragung möglich, dass die Website auch in der Wartezeit steuerbar ist.
        this.selectedControllsChange();
      });
    }

  getFields(): void {
    console.log(`Got Fieldrequest`);
    this.fieldsService.getFields()
      .subscribe(fields => {
        this.controllings.fields=[
          fields[fields.map(function(e) {return e.name;}).indexOf('t')],
          fields[fields.map(function(e) {return e.name;}).indexOf('regen')],
          fields[fields.map(function(e) {return e.name;}).indexOf('wr')]
        ] 
        this.fields = fields      //Man subsribed sich auf den Service. Damit ist es trotz synchroner Client-Server Übertragung möglich, dass die Website auch in der Wartezeit steuerbar ist.
        this.selectedControllsChange(); 
      });
    }

  selectedControllsChange(): void{
    console.log("CHANGE!")
    console.log(this.controllings.stations.length)
    var newCont:Controllings;
    newCont = {
      stations: this.controllings.stations,
      fields: this.controllings.fields,
      date: this.controllings.date
    };
    this.controllings = newCont;        //neues Array, ansonsten wird ngOnChange in den Childcomponents nicht getriggert!
  }
  constructor(
    private stationsService: StationsService,
    private fieldsService: FieldsService,
  ) { 

  }
  format(date: Date) {
    var d = new Date(date),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
  }

  ngOnInit(): void {
    var stations: Station[] = [];
    var fields: Field[] = [];
    var date = this.format(new Date());
    this.controllings= {
      stations,
      fields,
      date}
    this.getStations();
    this.getFields();
    this.choosenSite = 'overview';
  }
  

}
