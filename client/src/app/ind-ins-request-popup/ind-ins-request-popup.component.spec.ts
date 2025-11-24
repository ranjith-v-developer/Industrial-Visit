import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndInsRequestPopupComponent } from './ind-ins-request-popup.component';

describe('IndInsRequestPopupComponent', () => {
  let component: IndInsRequestPopupComponent;
  let fixture: ComponentFixture<IndInsRequestPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndInsRequestPopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IndInsRequestPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
