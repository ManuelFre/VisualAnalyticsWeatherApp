import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MainPlotlyComponentComponent } from './main-plotly-component/main-plotly-component.component';

import { CommonModule } from '@angular/common';
import { HttpClientModule }    from '@angular/common/http';

import * as PlotlyJS from 'plotly.js/dist/plotly.js';
//import { PlotlyModule } from 'angular-plotly.js';


//PlotlyModule.plotlyjs = PlotlyJS;
import { NgSelectModule } from '@ng-select/ng-select';

import { PlotlyViaCDNModule  } from 'angular-plotly.js';
import { FormsModule } from '@angular/forms';
  PlotlyViaCDNModule.plotlyVersion = 'latest'; 
  PlotlyViaCDNModule.plotlyBundle = null;


@NgModule({
  declarations: [
    AppComponent,
    MainPlotlyComponentComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    CommonModule, 
    //PlotlyModule
    PlotlyViaCDNModule,
    NgSelectModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
