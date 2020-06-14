import { Injectable } from '@angular/core';
import { Station } from './station';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
//import { Vote } from './vote';

@Injectable({
  providedIn: 'root'
})
export class StationsService {

  private stationUrl = 'api/v1/stations';          //durch Konfiguration in proxy.conf.json und Anpassungen von package.json 
                                                    //( --proxy-config ./src/proxy.conf.json) und angular.json ("proxyConfig": "src/proxy.conf.json")
                                                    //werden alle /api/* Abfragen über den von Angular erstellten Proxy auf das unter proxy.conf.json angegebene target umgeleitet.

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json'})
    //headers: new HttpHeaders({ 'Content-Type': 'text/plain; charset=utf-8' })
  };

  constructor(
    private http: HttpClient
  ) { }

   
  getStations(): Observable<Station[]> {
    //const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this.http.get(this.stationUrl,{responseType: 'text'})
      .pipe(
        map(text => this.transformTextToStations(text)),
        tap(_ => console.log('fetched stations')),
        catchError(this.handleError<any>('getStations'))
      );
  }

  private transformTextToStations(text: string): Station[]{
    var stations: Station[];
    stations = [];

    const allTextLines = text.split('\n');
    for (var i=0; i<allTextLines.length; i++) {
        var data = allTextLines[i].split(';');
        if (data.length > 1){        
            var station: Station = {
            id: parseInt(data[0].replace(/\'/g,'')),
            name: data[1].replace(/\'/g,''),
            seaLevel: parseFloat(data[2].replace(/\'/g,'')),
            unit: data[3].replace(/\'/g,''),
            color:'#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6)
            };
            if (station.id > 11){     //ausschluss der falschen Feuerkogel ID
              stations.push(station); 
            }        
        
        }                  
    }

    return stations;
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
