import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndustrialVisitListComponent } from './industrial-visit-list.component';

describe('IndustrialVisitListComponent', () => {
  let component: IndustrialVisitListComponent;
  let fixture: ComponentFixture<IndustrialVisitListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndustrialVisitListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IndustrialVisitListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
