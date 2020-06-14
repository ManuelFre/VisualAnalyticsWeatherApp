import { Injectable } from '@angular/core';
import { Timeserieselement } from './timeserieselement';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
//import { Vote } from './vote';

@Injectable({
  providedIn: 'root'
})
export class TimeseriesService {

  private stationUrl = 'api/v1/station/';          //durch Konfiguration in proxy.conf.json und Anpassungen von package.json 
                                                    //( --proxy-config ./src/proxy.conf.json) und angular.json ("proxyConfig": "src/proxy.conf.json")
                                                    //werden alle /api/* Abfragen über den von Angular erstellten Proxy auf das unter proxy.conf.json angegebene target umgeleitet.

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json'})
    //headers: new HttpHeaders({ 'Content-Type': 'text/plain; charset=utf-8' })
  };

  constructor(
    private http: HttpClient
  ) { }

   
  getTimeseries(stationid: number, measurement: string, day: string): Observable<Timeserieselement[]> {
    //const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this.http.get(this.stationUrl + '/' + stationid + '/' + measurement + '/' + day + '/',{responseType: 'text'})
      .pipe(
        map(text => this.transformTextToTimeseries(text)),
        tap(_ => console.log('fetched timeseries')),
        catchError(this.handleError<any>('getTimeseries'))
      );
  }

  private transformTextToTimeseries(text: string): Timeserieselement[]{
    var timeseries: Timeserieselement[];
    timeseries = [];

    const allTextLines = text.split('\n');
    for (var i=0; i<allTextLines.length; i++) {
        var data = allTextLines[i].split(';');
        if (data.length > 1){        
            var timeserieselement: Timeserieselement = {
            datetime: new Date(data[3].replace(/\'/g,'') + 'T' + data[4].replace(/\'/g,'')),
            value: parseFloat(data[5].replace(/\'/g,'')),
            unit: data[6].replace(/\'/g,'')
            };        
            timeseries.push(timeserieselement); 
        }                  
    }
    return timeseries;
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
  
      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead
  
      // TODO: better job of transforming error for user consumption
      console.log(`${operation} failed: ${error.message}`);
  
      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }


  
}
