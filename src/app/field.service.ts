import { Injectable } from '@angular/core';
import { Field } from './field';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
//import { Vote } from './vote';

@Injectable({
  providedIn: 'root'
})
export class FieldsService {

  private fieldUrl = 'api/v1/fields';          //durch Konfiguration in proxy.conf.json und Anpassungen von package.json 
                                                    //( --proxy-config ./src/proxy.conf.json) und angular.json ("proxyConfig": "src/proxy.conf.json")
                                                    //werden alle /api/* Abfragen über den von Angular erstellten Proxy auf das unter proxy.conf.json angegebene target umgeleitet.

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json'})
    //headers: new HttpHeaders({ 'Content-Type': 'text/plain; charset=utf-8' })
  };

  constructor(
    private http: HttpClient
  ) { }

   
  getFields(): Observable<Field[]> {
    //const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    return this.http.get(this.fieldUrl,{responseType: 'text'})
      .pipe(
        map(text => this.transformTextToFields(text)),
        tap(_ => console.log('fetched fields')),
        catchError(this.handleError<any>('getFields'))
      );
  }

  private transformTextToFields(text: string): Field[]{
    var fields: Field[];
    fields = [];

    const allTextLines = text.split('\n');
    for (var i=0; i<allTextLines.length; i++) {
        var data = allTextLines[i].split(';');
        if (data.length > 1){        
            var field: Field = {
            name: data[0].replace(/\'/g,''),
            type: data[1].replace(/\'/g,'')
            };        
        fields.push(field); 
        }                  
    }

    return fields;
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
