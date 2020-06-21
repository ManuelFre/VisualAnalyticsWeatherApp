import { Injectable } from '@angular/core';
import { Field } from './field';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import  weathertypesExtended from './additionalResources/weathertypesExtended.json';
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
        var fieldname: string = data[0].replace(/\'/g,'');
        var weathertypesExtendedIndex = weathertypesExtended.map(function(e) {return e["field name"]}).indexOf(fieldname)

        if (data.length > 1 && weathertypesExtendedIndex > -1){               //Da die API sehr wenig Informationen über die Messtypen enthält muss leider ein innerjoin erfolgen.
            var field: Field = {
              name: fieldname,
              type: data[1].replace(/\'/g,''),
              description: weathertypesExtended[weathertypesExtendedIndex].description,
              unit: weathertypesExtended[weathertypesExtendedIndex].unit,
              maxValue: weathertypesExtended[weathertypesExtendedIndex].MaxValue,
              minValue: weathertypesExtended[weathertypesExtendedIndex].MinValue          
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
