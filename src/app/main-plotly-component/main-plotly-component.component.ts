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
  selectedFields: Field[];
  displayedFields: Field[];
  selectedStations: Station[];
  displayedStations: Station[];
  timeseriescollections: Timeseriescollection[];
  graphs;
  selectedDate: String;
  

  getStations(): void {
    console.log(`Got Stationrequest`);
    this.stationsService.getStations()
      .subscribe(stations => {
        this.selectedStations=[(stations[stations.map(function(e) {return e.name;}).indexOf('Wien/Hohe Warte')])] 
        this.stations = stations      //Man subsribed sich auf den Service. Damit ist es trotz synchroner Client-Server Übertragung möglich, dass die Website auch in der Wartezeit steuerbar ist.
        this.selectedStationsChange();
      });
    }

  getFields(): void {
    console.log(`Got Fieldrequest`);
    this.fieldsService.getFields()
      .subscribe(fields => {
        this.selectedFields=[
          fields[fields.map(function(e) {return e.name;}).indexOf('t')],
          fields[fields.map(function(e) {return e.name;}).indexOf('ldstat')],
          fields[fields.map(function(e) {return e.name;}).indexOf('ldred')]
        ] 
        this.fields = fields      //Man subsribed sich auf den Service. Damit ist es trotz synchroner Client-Server Übertragung möglich, dass die Website auch in der Wartezeit steuerbar ist.
        this.selectedFieldsChange(); 
      });
    }

  getTimeseries(stat: Station, fd: Field, day: string): void{
    console.log(`Got Timeseriesrequest`);
    //const fd: Field = {name: 'T', type: 'string'}
    var timeseriescollection: Timeseriescollection = {
      station: stat,
      field: fd,
      day: day,
      timeseries: []
    };
    console.log(`Load Timeseries for Station ${stat.name}, Field ${fd.name} and day ${day}`)
    this.timeseriesService.getTimeseries(stat.id,fd.name, day)
      .subscribe(timeseries => {
        timeseriescollection.timeseries = timeseries
        this.timeseriescollections.push(timeseriescollection)      //Man subsribed sich auf den Service. Damit ist es trotz synchroner Client-Server Übertragung möglich, dass die Website auch in der Wartezeit steuerbar ist.
        this.drawTimeseriescollection(timeseriescollection,fd);
        console.log(`First returned value of timeseries: ${timeseriescollection.timeseries[0].value}`)
        });

  }

  drawTimeseriescollection(timeseriescollection: Timeseriescollection, field: Field){
    console.log("DrawGraph...")
    //var xval: Date[];
    var xval: number[];
    var yval: number[];
    var cnt;

    //this.timeseriescollections.forEach(timeseriescollection => {
      xval = [];
      yval = [];  
      cnt = 0;
      timeseriescollection.timeseries.forEach(timeserieselement => {
        xval.push(cnt);
        yval.push(timeserieselement.value);
        cnt = cnt + 1;
      });
      this.graphs.forEach(graph => {
        if(graph.field === field){
          graph.data.push({ x: xval, y: yval, type: 'scatter', mode: 'lines+points', name: timeseriescollection.station.name, marker: {color: timeseriescollection.station.color},station: timeseriescollection.station })
          console.log("Reihe hinzugefügt")
        }       
      });
      
  //  });
  }

  removeStationFromGraph(station: Station){
    this.graphs.forEach(graph => {
      graph.data.forEach(graphdata => {
        if(graphdata.name === station.name){
          console.log(`Graphdata spliced. Removed ${graphdata.name}`);
          graph.data.splice(graph.data.indexOf(graphdata), 1);       
        }
      });
    });
    

  }
  removeFieldGraph(field: Field){
    this.graphs.forEach(graph => {
      if(graph.field === field){
        console.log(`Graph spliced. Removed ${field.name}`);
        this.graphs.splice(this.graphs.indexOf(graph), 1);       
      }
    });

    console.log("Fieldgraph should be deleted")

  }

  addFieldGraph(field: Field){
    var newGraph ={
      data: [],
      layout: {/*width: 1500, height: 500,*/margin:0, title: field.name},
      field: field
    }
    this.graphs.push(newGraph)
    console.log(`Graph ${newGraph.layout.title} created`)

  }

  constructor(
    private stationsService: StationsService,
    private fieldsService: FieldsService,
    private timeseriesService: TimeseriesService,

  ) { 

  }
  format(date: Date) {
    var d = date.getDay();
    var m = date.getMonth() + 1;
    var y = date.getFullYear();
    return '' + y + '-' + (m<=9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d);
  }

  ngOnInit(): void {
    this.selectedStations =[];
    this.displayedStations =[];
    this.timeseriescollections = [];
    this.selectedFields= [];
    this.displayedFields= [];
    this.graphs = [];
    this.selectedDate = this.format(new Date())
    this.getStations();
    this.getFields();
  }
  
  selectedStationsChange(): void {
    var tmpStations: Station[];
    tmpStations=[];

    //load all Stations in temp variable and add Timeseries if not in this.displayedstations 
    this.selectedStations.forEach(selectedStation => {
      tmpStations.push(selectedStation)
      if (this.displayedStations.indexOf(selectedStation) === -1 ){
        this.selectedFields.forEach(selectedField => {
          this.getTimeseries(selectedStation, selectedField, this.selectedDate.toString());
        })       
        console.log(`Added Station: ${selectedStation.name}`);
      }
    });

    //delete Stations which got disabled
    this.displayedStations.forEach(displayedStation => {
      if (tmpStations.indexOf(displayedStation) === -1 ){
        this.removeStationFromGraph(displayedStation);
        console.log(`Removed Station: ${displayedStation.name}`);
      }
    })
    
    this.displayedStations = tmpStations;
    
    console.log(`Neue Stationswahl mit ${this.selectedStations.length} Stationen`)

    this.selectedStations.forEach(element => {
      console.log(`Selected Station: ${element.name}`);
    });
  }


  selectedFieldsChange(): void {
    var tmpFields: Field[];
    tmpFields=[];

    //load all Fields in temp variable and add Timeseries if not in this.displayedstations 
    this.selectedFields.forEach(selectedField => {
      tmpFields.push(selectedField)
      if (this.displayedFields.indexOf(selectedField) === -1 ){
        this.addFieldGraph(selectedField)
        this.displayedStations.forEach(displayedStation => {
          this.getTimeseries(displayedStation,selectedField,this.selectedDate.toString());
        })       
        console.log(`Added Field: ${selectedField.name}`);
      }
    });

    //delete Fields which got disabled
    this.displayedFields.forEach(displayedField => {
      if (tmpFields.indexOf(displayedField) === -1 ){
        this.removeFieldGraph(displayedField);
        console.log(`Removed Field: ${displayedField.name}`);
      }
    })
    
    this.displayedFields = tmpFields;
    
    console.log(`Neue Feldauswahl mit ${this.selectedFields.length} Feldern`)

    this.selectedFields.forEach(element => {
      console.log(`Selected Field: ${element.name}`);
    });
  }

  selectedDateChange(): void{
    console.log(`Date changed to ${this.selectedDate.toString()}`)

    var tmpgraphdata = [];
    if(this.selectedDate != null){
      this.graphs.forEach(graph => {
        tmpgraphdata = JSON.parse(JSON.stringify(graph.data));        //Deep copy erstellen, sonst funktioniert das löschen der Einträge in der Foreach nicht.
        tmpgraphdata.forEach(graphdata => {
          this.getTimeseries(graphdata.station ,graph.field, this.selectedDate.toString())
          graph.data.splice(graph.data.indexOf(graphdata), 1)
        });
      });
    }

    
  }


}
