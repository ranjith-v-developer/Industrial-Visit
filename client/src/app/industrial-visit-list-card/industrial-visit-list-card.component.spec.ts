import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndustrialVisitListCardComponent } from './industrial-visit-list-card.component';

describe('IndustrialVisitListCardComponent', () => {
  let component: IndustrialVisitListCardComponent;
  let fixture: ComponentFixture<IndustrialVisitListCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndustrialVisitListCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IndustrialVisitListCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
