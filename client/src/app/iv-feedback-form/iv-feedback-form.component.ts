import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { IndustrialVisitServiceApi } from '../services/industrial-visit-api.service';
import { VisitorServiceApi } from '../services/visitors-api.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-iv-feedback-form',
  standalone: true,
  imports: [ CommonModule, RouterLink, RouterOutlet,
    ReactiveFormsModule, FormsModule, 
   ],
  templateUrl: './iv-feedback-form.component.html',
  styleUrl: './iv-feedback-form.component.scss'
})
export class IvFeedbackFormComponent {
  public loading: boolean = false;
  public error = '';
  public ivDetails: any = {};
  public ivId = '';
  public visitorId = '';
  public feedbackForm: FormGroup;
  public submittedStatus = '';

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private industrialVisitService: IndustrialVisitServiceApi,
    private visitorServiceApi: VisitorServiceApi,
  ) {   
    this.feedbackForm = this.formBuilder.group({
      rating: ['', [Validators.required]],
      comments: [''],
    });

    const splitUrl = this.router.url.split('/')
    this.ivId = splitUrl[3];
    this.visitorId = splitUrl[5];
  }

  public async ngOnInit() {
    await this.getindustrialVisitById();
  }

  public async getindustrialVisitById() {
    try {
      this.loading = true;
      let data: any = await this.industrialVisitService.getIndustrialVisitById(this.ivId)
      let visitor: any = await this.visitorServiceApi.getVisitorById(this.visitorId)
      if(visitor && visitor.rating === null && !visitor.allowToFeedback) {
        this.router.navigate([ '/home' ])
        return
      }
      if(visitor && visitor.rating !== null && visitor.allowToFeedback === false){
         this.submittedStatus = 'done';
         return
      }
      this.ivDetails = data;
      this.loading = false;
    } catch (error) {
      this.loading = false;
      console.error(error)
    }
  }

  public async feedbackSubmit() {   
    this.error = '';
    if (this.feedbackForm.valid) {
      this.loading = true;
      await this.visitorServiceApi.feedbackSubmission(this.visitorId, { ...this.feedbackForm.value, allowToFeedback: false }).then(()=> {        
        this.loading = false;
        this.submittedStatus = 'thank';
        this.feedbackForm.reset('');
      }).catch((e)=>{
        this.loading = false;
        this.submittedStatus = 'error';
        this.error = e?.error || ''
      })
    } else {
      this.feedbackForm.markAllAsTouched();
    }
  }

}
