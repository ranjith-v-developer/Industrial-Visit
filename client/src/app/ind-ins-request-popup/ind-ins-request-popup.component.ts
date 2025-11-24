import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IndustryInstituteServiceApi } from '../services/industry-institue-api.service';
import { CommonModule } from '@angular/common';
import { MatRadioModule } from '@angular/material/radio';
import { LoaderComponent } from '../loader/loader.component';
import { MatDialogRef } from '@angular/material/dialog';
import { isEmpty } from 'lodash';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-ind-ins-request-popup',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule, 
    MatRadioModule, LoaderComponent, MatSelectModule
  ],
  templateUrl: './ind-ins-request-popup.component.html',
  styleUrl: './ind-ins-request-popup.component.scss'
})
export class IndInsRequestPopupComponent {
  @Input() public requestData: any = {};
  @Input() public isVerification: boolean = false;
  
  public requestForm: FormGroup;
  public types: any = [
    { name: 'Industry', value: 'industry' },
    { name: 'Institute', value: 'institute' }
  ]
  public statusList: any = [
    { name: 'Rejected', value: 'rejected' },
    { name: 'Approved', value: 'approved' }
  ]
  public apiError: string = '';
  public loading: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private industryInstituteService: IndustryInstituteServiceApi,
    private dialogRef: MatDialogRef<IndInsRequestPopupComponent>
  ) {
    this.requestForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      email: ['', [Validators.required, Validators.email]],
      website: ['', [Validators.required, Validators.minLength(5)]],
      city: ['', [Validators.required, Validators.minLength(2)]],
      district: ['', [Validators.required, Validators.minLength(2)]],
      state: ['', [Validators.required, Validators.minLength(2)]],
      pincode: ['', [Validators.required, Validators.minLength(5)]],
      ph_no: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      type: ['institute', [Validators.required]],
      reporterEmail: ['', [Validators.required, Validators.email]],
      status: [`${this.isVerification ? '' : 'pending'}`, [Validators.required]],
      comments: ['']
    });
  }

  public async ngOnInit() {
      if (!isEmpty(this.requestData)) {
        this.requestForm.patchValue({ ...this.requestData, status: '' })
      }
  }

  public async requestSubmit() {
    if (this.requestForm.valid) {
      this.loading = true;
      if (!this.isVerification) {
        await this.industryInstituteService.createIndustryInstitute(this.requestForm.value).then(()=> {
          this.apiError = '';
          this.loading = false;
          this.requestForm.reset('')
          this.dialogRef.close()
        })
        .catch(()=> {
          this.loading = false;
          this.apiError = 'Something went wrong'
        })
      } else {
        await this.industryInstituteService.updateIndustryInstitute(this.requestForm.value, this.requestData.id, this.isVerification).then(()=> {
          this.apiError = '';
          this.loading = false;
          this.requestForm.reset('')
          this.dialogRef.close()
        })
        .catch(()=> {
          this.loading = false;
          this.apiError = 'Something went wrong'
        })
      }
    } else {     
      this.requestForm.markAllAsTouched();
    }
  }
}
