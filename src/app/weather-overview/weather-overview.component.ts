import { Component, OnInit, Input } from '@angular/core';
import { Controllings } from '../controllings';
import { Station } from '../station';
import { Field } from '../field';
import { Timeserieselement } from '../timeserieselement';
import { Timeseriescollection } from '../timeseriescollection';
import { TimeseriesService } from '../timeseries.service';
import { PlotlyModule } from 'angular-plotly.js';
import { FormBuilder, FormControl, NgModel } from '@angular/forms';
import { Plotly } from 'angular-plotly.js/src/app/shared/plotly.interface';

@Component({
  selector: 'app-weather-overview',
  templateUrl: './weather-overview.component.html',
  styleUrls: ['./weather-overview.component.css']
})

export class WeatherOverviewComponent implements OnInit {
  @Input() controllings: Controllings;        //Besagt, dass beim Aufruf des Components ein controlling mitgegeben wird


  ngOnChanges() {
    console.log("Da hat sich was geändert")
    
    this.selectedFieldsChange();
    this.selectedStationsChange();
    if(this.controllings.date != this.selectedDate){
      this.selectedDateChange();
      this.selectedDate = this.controllings.date;
    }

}
  checkoutForm;
  stations: Station[];
  //fields: Field[];
  //selectedFields: Field[];
  displayedFields: Field[];
  //selectedStations: Station[];
  displayedStations: Station[];
  timeseriescollections: Timeseriescollection[];
  graphs;
  gauchos;
  selectedDate: String;
  

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
        });

  }

  drawTimeseriescollection(timeseriescollection: Timeseriescollection, field: Field){
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
          
          graph.data.push({ 
            x: xval, 
            y: yval, 
            type: (graph.field.name === 'regen') ? 'bar' : 'scatter', 
            mode: (graph.field.unit === '°') ? 'markers' :'lines+markers', 
            name: timeseriescollection.station.name, 
            marker: {color: timeseriescollection.station.color},
            station: timeseriescollection.station,
          })   
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
      layout: {
        width: 600, height: 500,
        margin:0, 
        title: field.description,
        xaxis: {
          mirror: true,
          title: "Stunde",
          automargin: true
          },
        yaxis: {
          mirror: true,
          automargin: true,
          title: field.unit 
        },
        annotations:[],

      },
      field: field,
      
    }
    this.graphs.push(newGraph)
    console.log(`Graph ${newGraph.layout.title} created`)
  }

  constructor(
    private timeseriesService: TimeseriesService,
    
  ) { 
    if(this.graphs === undefined){
      this.ngOnInit();
    }

  }


  ngOnInit(): void {
    this.displayedStations =[];
    this.timeseriescollections = [];
    //this.selectedFields= [];
    this.displayedFields= [];
    this.graphs = [];
    this.gauchos =[];
    this.selectedDate ="";
    this.testGaucho();
  }
  
  selectedStationsChange(): void {
    var tmpStations: Station[];
    tmpStations=[];

    console.log(`Bisher ${this.displayedStations.length} Stationen ausgewählt`)
    //load all Stations in temp variable and add Timeseries if not in this.displayedstations 
    this.controllings.stations.forEach(selectedStation => {
      tmpStations.push(selectedStation)
      if (this.displayedStations.indexOf(selectedStation) === -1 ){
        this.controllings.fields.forEach(selectedField => {
          this.getTimeseries(selectedStation, selectedField, this.controllings.date.toString());
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
    
    console.log(`Neue Stationswahl mit ${this.controllings.stations.length} Stationen`)

    this.controllings.stations.forEach(element => {
      console.log(`Selected Station: ${element.name}`);
    });
  }


  selectedFieldsChange(): void {
    var tmpFields: Field[];
    tmpFields=[];

    //load all Fields in temp variable and add Timeseries if not in this.displayedstations 
    this.controllings.fields.forEach(selectedField => {
      tmpFields.push(selectedField)
      if (this.displayedFields.indexOf(selectedField) === -1 ){
        this.addFieldGraph(selectedField)
        this.displayedStations.forEach(displayedStation => {
          this.getTimeseries(displayedStation,selectedField,this.controllings.date.toString());
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
    
    console.log(`Neue Feldauswahl mit ${this.controllings.fields.length} Feldern`)

    this.controllings.fields.forEach(element => {
      console.log(`Selected Field: ${element.name}`);
    });
  }

  selectedDateChange(): void{
    console.log(`Date changed to ${this.controllings.date.toString()}`)

    var tmpgraphdata = [];
    if(this.controllings.date != null){
      this.graphs.forEach(graph => {
        tmpgraphdata = JSON.parse(JSON.stringify(graph.data));        //Deep copy erstellen, sonst funktioniert das löschen der Einträge in der Foreach nicht.
        tmpgraphdata.forEach(graphdata => {
          this.getTimeseries(graphdata.station ,graph.field, this.controllings.date.toString())
          graph.data.splice(graph.data.indexOf(graphdata), 1)
        });
      });
    }

    
  }

  testGaucho(){
    var data = [
      {
        type: "indicator",
        value: 200,
        delta: { reference: 160 },
        gauge: { axis: { visible: true, range: [0, 250] } }
      }
    ];
    
    var layout = {
      width: 600,
      height: 400,
      margin: { t: 25, b: 25, l: 25, r: 25 },
      template: {
        data: {
          indicator: [
            {
              title: { text: "Speed" },
              mode: "number+delta+gauge",
              delta: { reference: 90 }
            }
          ]
        }
      }
    };

    var gaucho = {
      data: data,
      layout: layout
    }
  this.gauchos.push(gaucho);
  }

}
