import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WindDetailsComponent } from './wind-details.component';

describe('WindDetailsComponent', () => {
  let component: WindDetailsComponent;
  let fixture: ComponentFixture<WindDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WindDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WindDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
