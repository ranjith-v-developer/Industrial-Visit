import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndustrialVisitApplyComponent } from './industrial-visit-apply.component';

describe('IndustrialVisitApplyComponent', () => {
  let component: IndustrialVisitApplyComponent;
  let fixture: ComponentFixture<IndustrialVisitApplyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndustrialVisitApplyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IndustrialVisitApplyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
