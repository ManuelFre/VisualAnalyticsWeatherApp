import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MainPlotlyComponentComponent } from './main-plotly-component.component';

describe('MainPlotlyComponentComponent', () => {
  let component: MainPlotlyComponentComponent;
  let fixture: ComponentFixture<MainPlotlyComponentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MainPlotlyComponentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MainPlotlyComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
