import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndustrialVisitEditComponent } from './industrial-visit-edit.component';

describe('IndustrialVisitEditComponent', () => {
  let component: IndustrialVisitEditComponent;
  let fixture: ComponentFixture<IndustrialVisitEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndustrialVisitEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IndustrialVisitEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
