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
  selector: 'app-gauges',
  templateUrl: './gauges.component.html',
  styleUrls: ['./gauges.component.css']
})
export class GaugesComponent implements OnInit {
  @Input() controllings: Controllings;        //Besagt, dass beim Aufruf des Components ein controlling mitgegeben wird
  
  graphs;
  stationContainer: [];
  stations: Station[];
  displayedFields: Field[];
  displayedStations: Station[];
  timeseriescollections: Timeseriescollection[];
  selectedDate: String;

  ngOnChanges() {
    this.selectedFieldsChange();
    this.selectedStationsChange();
    if(this.controllings.date != this.selectedDate){
      this.selectedDateChange();
      this.selectedDate = this.controllings.date;
    }
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

  getTimeseries(stat: Station, fd: Field, day: string): void{
    console.log(`Got Timeseriesrequest`);
    //const fd: Field = {name: 'T', type: 'string'}
    var timeseriescollection: Timeseriescollection = {
      station: stat,
      field: fd,
      day: day,
      timeseries: []
    };
    var thisDaysDate = new Date(day)


    var timeseriescollectionDayBefore: Timeseriescollection = {
      station: stat,
      field: fd,
      day: this.format(new Date(thisDaysDate.setDate(thisDaysDate.getDate() - 1))),
      timeseries: []
    };

    console.log(`Load Timeseries for Station ${stat.name}, Field ${fd.name} and day ${day} compared with day ${timeseriescollectionDayBefore.day}`)
    this.timeseriesService.getTimeseries(stat.id,fd.name, day)
      .subscribe(timeseries => {
        timeseriescollection.timeseries = timeseries
        this.timeseriesService.getTimeseries(stat.id,fd.name, timeseriescollectionDayBefore.day)
          .subscribe(timeseriesDayBefore => {
            timeseriescollectionDayBefore.timeseries = timeseriesDayBefore
            if(this.timeseriescollections.filter(function(element, index, array){return (element.field == fd && element.station == stat && element.day == day)}).length === 0){
              this.timeseriescollections.push(timeseriescollection)
              this.drawTimeseriescollection(timeseriescollection,timeseriescollectionDayBefore,fd);
            }
          });
        });

  }

  drawTimeseriescollection(timeseriescollection: Timeseriescollection,timeseriescollectionDayBefore: Timeseriescollection, field: Field){
  
    var sum: number = 0;
    var cnt: number = 0;
    var sumDayBefore: number = 0;
    var cntDayBefore: number = 0;

    timeseriescollection.timeseries.forEach(timeserieselement => {
      sum += timeserieselement.value;
      cnt += 1;
    });

    timeseriescollectionDayBefore.timeseries.forEach(timeserieselement => {
      sumDayBefore += timeserieselement.value;
      cntDayBefore += 1;
    });
    console.log(`Vortageswerte: ${sumDayBefore/cntDayBefore}`)
    var data = [{ 
      type: "indicator",
      value: Math.round(sum/cnt),
      delta: { reference: Math.round(sumDayBefore/cntDayBefore) },
      gauge: { 
        axis: { 
          visible: true, 
          range: [field.maxValue, field.minValue]
        },
        bar: {color: "darkblue"} 
      },
      title: field.description,
      //name: timeseriescollection.field.name, 
      //marker: {color: timeseriescollection.station.color},
    } ] 
    
    var layout = {
      width: 600,
      height: 400,
      margin: { t: 30, b: 30, l: 30, r: 30 },
      template: {
        data: {
          indicator: [
            {
              title: { text: timeseriescollection.field.name },
              mode: "number+delta+gauge",
              delta: { reference: 90 }
            }
          ]
        }
      }
    };

    var gaucho = {
      data: data,
      layout: layout,
      station: timeseriescollection.station,
      field: field
    }
  this.graphs.push(gaucho)
  this.graphs.sort((a,b) => (a.field.name > b.field.name) ? 1 : -1)
  this.graphs.sort((a,b) => (a.station.name > b.station.name) ? 1 : -1)
  this.displayedStations.sort((a,b) => (a.name > b.name) ? 1 : -1)
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
    this.selectedDate ="";
    this.stationContainer= [];
  }
  



  //---------------------------------------Changes: --------------------------
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
        //this.addFieldGraph(selectedField)
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

    var tmpgraphs = JSON.parse(JSON.stringify(this.graphs));
    if(this.controllings.date != null){
      tmpgraphs.forEach(graph => {
        this.graphs.splice(this.graphs.indexOf(graph), 1)
        this.getTimeseries(graph.station ,graph.field, this.controllings.date.toString())       
      });
    }

    
  }
}
