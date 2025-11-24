import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndustryInstitueRequestComponent } from './industry-institue-request.component';

describe('IndustryInstitueRequestComponent', () => {
  let component: IndustryInstitueRequestComponent;
  let fixture: ComponentFixture<IndustryInstitueRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndustryInstitueRequestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IndustryInstitueRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
