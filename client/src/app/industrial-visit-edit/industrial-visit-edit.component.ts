import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { DEPARTSMENTS } from '../../config/config';
import { Router } from '@angular/router';
import { IndustrialVisitServiceApi } from '../services/industrial-visit-api.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MatNativeDateModule, NativeDateAdapter } from '@angular/material/core';
import dayjs from 'dayjs';
import { LoaderComponent } from '../loader/loader.component';


export class CustomDateAdapter extends NativeDateAdapter {
  override format(date: Date): string {
    return dayjs(date).format('DD-MM-YYYY'); // Change this to your desired format
  }
}

@Component({
  selector: 'app-industrial-visit-edit',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule, 
    MatRadioModule, MatSelectModule, MatDatepickerModule,
    MatNativeDateModule, LoaderComponent
  ],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
  ],
  templateUrl: './industrial-visit-edit.component.html',
  styleUrl: './industrial-visit-edit.component.scss'
})
export class IndustrialVisitEditComponent {
  public ivForm: FormGroup;
  public departments: any = DEPARTSMENTS;
  public loading: boolean = false;
  public error = '';
  public userData: any = {};
  public minData = dayjs().add(1, 'day').format();
  public isEdit = false;
  public ivId = '';
  public originalData: any = {};
  public countError = {
    no_of_students: false,
    no_of_faculty: false,
    available_institute: false
  };

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private industrialVisitService: IndustrialVisitServiceApi,
  ) {
    this.ivForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required]],
      course_and_dept: [[], [Validators.required]],
      no_of_students: ['', [Validators.required]],
      no_of_faculty: ['', [Validators.required]],
      contact_person: ['', [Validators.required]],
      contact_no: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      alternative_contact_no: ['', Validators.pattern(/^[0-9]{10}$/)],
      food_provide: [false],
      available_institute: ['', [Validators.required]],
      location: ['', [Validators.required]],
      start_date: ['', [Validators.required]],
      end_date: ['', [Validators.required]]
    });
  }

  public async ngOnInit() {
    const splitUrl = this.router.url.split('/')
    this.userData = localStorage.getItem('userData')
    this.userData = JSON.parse(this.userData)
    if (splitUrl.includes('modify')) {
      this.loading = true;
      this.isEdit = true;
      const id = splitUrl[3]
      this.ivId = id;
      await this.getindustrialVisitById(id);
    }
  }

  public async getindustrialVisitById(id: string) {
    try {
      let data: any = await this.industrialVisitService.getIndustrialVisitById(id)
      if(data) {
        data = {
          ...data,
          course_and_dept: data.course_and_dept.split(',')
        }
        this.originalData = data;
        this.ivForm.patchValue(data)
      }
      this.loading = false;
    } catch (error) {
      this.loading = false;
      console.error(error)
    }
  }

  getButtonLabel(): string {
    if (this.loading) {
      return this.isEdit ? 'Saving...' : 'Creating...';
    }
    return this.isEdit ? 'Save' : 'Create';
  }
  

  public async ivSubmit() {
    this.error = '';
    this.countError = {
      no_of_students: false,
      no_of_faculty: false,
      available_institute: false
    };   
    if (this.ivForm.valid) {
      this.loading = true;
      const payloadData = {
        ...this.ivForm.value,
        course_and_dept: this.ivForm.value.course_and_dept.join(','),
        industry: { id: this.userData.indIns.id },
        start_date: `${dayjs(this.ivForm.value.start_date).format('YYYY-MM-DD')}T12:00:00.000Z`,
        end_date: `${dayjs(this.ivForm.value.end_date).format('YYYY-MM-DD')}T12:00:00.000Z`,
      }
      if (this.originalData?.instituteData?.length > 0) {
        if (payloadData.no_of_students < this.originalData.no_of_students) {
          this.countError.no_of_students = true;
          this.loading = false;
          return;
        }
        if (payloadData.no_of_faculty < this.originalData.no_of_faculty) {
          this.countError.no_of_faculty = true;
          this.loading = false;
          return;
        }
        if (payloadData.available_institute < this.originalData.available_institute) {
          this.countError.available_institute = true;
          this.loading = false;
          return;
        }
      }
      const api = this.isEdit ? this.industrialVisitService.updateIndustrialVisit(payloadData, this.ivId)  : this.industrialVisitService.createIndustrialVisit(payloadData)
      await api.then(()=> {
        this.loading = false;
        this.ivForm.reset('');
        this.router.navigate(['/industry/industrial-visits']);
      }).catch((error)=> {
        this.loading = false;
        this.error = error;
        console.error('error --->', error)
      });
    } else {
      this.ivForm.markAllAsTouched();
    }
  }
}

