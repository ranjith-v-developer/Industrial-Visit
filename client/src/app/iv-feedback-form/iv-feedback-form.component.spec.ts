import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IvFeedbackFormComponent } from './iv-feedback-form.component';

describe('IvFeedbackFormComponent', () => {
  let component: IvFeedbackFormComponent;
  let fixture: ComponentFixture<IvFeedbackFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IvFeedbackFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IvFeedbackFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
