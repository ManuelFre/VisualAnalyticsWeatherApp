import { Component, OnInit, Input } from '@angular/core';
import { Controllings } from '../controllings';
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

@Component({
  selector: 'app-wind-details',
  templateUrl: './wind-details.component.html',
  styleUrls: ['./wind-details.component.css']
})
export class WindDetailsComponent implements OnInit {
  @Input() controllings: Controllings;        //Besagt, dass beim Aufruf des Components ein controlling mitgegeben wird
  @Input() fields: Field[];


  ngOnChanges(changes: Controllings) {
    this.selectedStationsChange();
    if(this.controllings.date != this.selectedDate){
      this.selectedDateChange();
      this.selectedDate = this.controllings.date;
    }

    if(this.fields != undefined && this.graphs.length == 0){
      this.addFieldGraph(this.fields.filter(field => field.name == 'wg')[0])
      this.annotationFields.push(this.fields.filter(field => field.name == 'wr')[0])
      this.addFieldGraph(this.fields.filter(field => field.name == 'wsg')[0])
      this.annotationFields.push(this.fields.filter(field => field.name == 'wsr')[0])
    }

}
  stations: Station[];
  //selectedFields: Field[];
  displayedFields: Field[];
  annotationFields: Field[];
  //selectedStations: Station[];
  displayedStations: Station[];
  timeseriescollections: Timeseriescollection[];
  graphs;
  gauchos;
  selectedDate: String;
  

  getTimeseriesForWindDetails(stat: Station, fd: Field, day: string): void{

    var timeseriescollection: Timeseriescollection = {
      station: stat,
      field: fd,
      day: day,
      timeseries: []
    };
    var annotationcollection: Timeseriescollection = {
      station: stat,
      field: this.annotationFields[this.displayedFields.indexOf(fd)],
      day: day,
      timeseries: []
    };
    console.log(`Load Timeseries for Station ${stat.name}, Field ${fd.name} and day ${day}`)
    this.timeseriesService.getTimeseries(stat.id,fd.name, day)
      .subscribe(timeseries => {
        timeseriescollection.timeseries = timeseries
        this.timeseriescollections.push(timeseriescollection)      //Man subsribed sich auf den Service. Damit ist es trotz synchroner Client-Server Übertragung möglich, dass die Website auch in der Wartezeit steuerbar ist.
        this.timeseriesService.getTimeseries(stat.id,annotationcollection.field.name,day)
          .subscribe(annotationseries =>{
            annotationcollection.timeseries = annotationseries
            this.drawTwoInOneTimeseriescollection(timeseriescollection,annotationcollection,fd);
          })
        });

  }

  drawTwoInOneTimeseriescollection(timeseriescollection: Timeseriescollection,annotationcollection: Timeseriescollection, field: Field){
    //var xval: Date[];
    var xval: number[];
    var yval: number[];
    var cnt;
    var annotation = []; 

    //this.timeseriescollections.forEach(timeseriescollection => {
      xval = [];
      yval = [];  
      cnt = 0;
      for(var i = 0; i<timeseriescollection.timeseries.length; i++){
        xval.push(cnt);
        yval.push(timeseriescollection.timeseries[i].value);
        annotation.push({    //Arrow for WindDirection
          x: cnt,
          y: timeseriescollection.timeseries[i].value,     
          text: '',
          showarrow: true,
          arrowhead: 2,
          axref:'x',
          ayref:'y',
          arrowcolor: timeseriescollection.station.color,

          ax: cnt + Math.sin((annotationcollection.timeseries[i].value)/180*Math.PI)*1.4,     //Berechne Koordinaten vom Pfeilende mit Winkel der Windrichtung

          ay: timeseriescollection.timeseries[i].value + 
                Math.cos((annotationcollection.timeseries[i].value)/180*Math.PI)/24*timeseriescollection.field.minValue*1.4,          
          station: timeseriescollection.station,
          day: timeseriescollection.day
        })
        cnt = cnt + 1;
      }

      this.graphs.forEach(graph => {
        if(graph.field === field){          
          graph.data.push({ 
            x: xval, 
            y: yval, 
            type: 'scatter',
            mode: 'markers',
            name: timeseriescollection.station.name, 
            marker: {color: timeseriescollection.station.color},
            station: timeseriescollection.station,
          })  
          var newAnnotations = graph.layout.annotations.concat(annotation)
          graph.layout.annotations = newAnnotations; 
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
      graph.layout.annotations = graph.layout.annotations.filter(function(element, index, array){return (element.station.id != station.id)})
      console.log(graph.layout.annotations)
    });
    

  }
  removeFieldGraph(field: Field){
    this.graphs.forEach(graph => {
      if(graph.field === field){
        console.log(`Graph spliced. Removed ${field.name}`);
        this.graphs.splice(this.graphs.indexOf(graph), 1);       
      }
    });
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
          automargin: true,
          range: [0, 23]
          },
        yaxis: {
          mirror: true,
          automargin: true,
          title: field.unit, 
          range: [field.maxValue,field.minValue]
        },
        annotations:[],

      },
      field: field,     
    }
    this.graphs.push(newGraph)
    this.displayedFields.push(field)
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
    this.annotationFields = [];
    this.graphs = [];
    this.selectedDate ="";
  }
  
  selectedStationsChange(): void {
    var tmpStations: Station[];
    tmpStations=[];

    console.log(`Bisher ${this.displayedStations.length} Stationen ausgewählt`)
    //load all Stations in temp variable and add Timeseries if not in this.displayedstations 
    this.controllings.stations.forEach(selectedStation => {
      tmpStations.push(selectedStation)
      if (this.displayedStations.indexOf(selectedStation) === -1 ){
        this.displayedFields.forEach(selectedField => {
          this.getTimeseriesForWindDetails(selectedStation, selectedField, this.controllings.date.toString());
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

  selectedDateChange(): void{
    console.log(`Date changed to ${this.controllings.date.toString()}`)

    var tmpgraphdata = [];
    if(this.controllings.date != null){
      this.graphs.forEach(graph => {
        tmpgraphdata = JSON.parse(JSON.stringify(graph.data));        //Deep copy erstellen, sonst funktioniert das löschen der Einträge in der Foreach nicht.
        tmpgraphdata.forEach(graphdata => {
          this.getTimeseriesForWindDetails(graphdata.station ,graph.field, this.controllings.date.toString())
          graph.data.splice(graph.data.indexOf(graphdata), 1)
        });
        graph.layout.annotations=[];
      });
    }

    
  }

}
