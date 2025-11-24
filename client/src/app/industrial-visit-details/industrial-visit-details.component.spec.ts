import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndustrialVisitDetailsComponent } from './industrial-visit-details.component';

describe('IndustrialVisitDetailsComponent', () => {
  let component: IndustrialVisitDetailsComponent;
  let fixture: ComponentFixture<IndustrialVisitDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndustrialVisitDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IndustrialVisitDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
