import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IndustrialVisitServiceApi } from '../services/industrial-visit-api.service';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { DEPARTSMENTS } from '../../config/config';
import { VisitorServiceApi } from '../services/visitors-api.service';
import { LoaderComponent } from '../loader/loader.component';

@Component({
  selector: 'app-industrial-visit-apply',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule, 
    MatSelectModule, LoaderComponent
  ],
  templateUrl: './industrial-visit-apply.component.html',
  styleUrl: './industrial-visit-apply.component.scss'
})
export class IndustrialVisitApplyComponent {
  public loading: boolean = false;
  public error = '';
  public ivDetails: any = {};
  public ivId = '';
  public userData: any = {};
  public visitorsForm: FormGroup;
  public departments: any[] = [];
  public isEdit: boolean = false;
  public removedEmails: string []= [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private industrialVisitService: IndustrialVisitServiceApi,
    private visitorService: VisitorServiceApi,
  ) {
    this.visitorsForm = this.formBuilder.group({
      faculty: this.formBuilder.array([]),
      students: this.formBuilder.array([])
    });
    const splitUrl = this.router.url.split('/');
    this.ivId = splitUrl[3];
    this.isEdit = splitUrl.includes('modify')
  }

  get faculty(): FormArray {
    return this.visitorsForm.get('faculty') as FormArray;
  }

  get students(): FormArray {
    return this.visitorsForm.get('students') as FormArray;
  }

  addFaculty(): void {
    const entry = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      type: ['faculty', Validators.required],
      reg_id: ['', [Validators.required]],
      contact_no: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      dept: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
    this.faculty.push(entry);
  }

  addStudents(): void {
    const entry = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      type: ['student', Validators.required],
      reg_id: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9]+$/)]],
      contact_no: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      dept: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
    this.students.push(entry);
  }

  removeFaculty(index: number): void {
    if (this.faculty.length > 1) {
      const facultyItem = this.faculty.at(index);
      if(facultyItem.get('email')?.value) this.removedEmails.push(facultyItem.get('email')?.value)
      this.faculty.removeAt(index);
    }
  }

  removeStudents(index: number): void {
    if (this.students.length > 1) {
      const studentItem = this.students.at(index);
      if(studentItem.get('email')?.value) this.removedEmails.push(studentItem.get('email')?.value)
      this.students.removeAt(index);
    }
  }


  public async ngOnInit() {
    this.userData = localStorage.getItem('userData')
    this.userData = JSON.parse(this.userData)
    await this.getindustrialVisitById(this.ivId);
    if (this.isEdit) {
      const visitorLists = this.ivDetails.instituteData.find((ins: any)=> ins.id === this.userData?.indIns?.id)?.visitors;
      const visitorListsObj: any = {};
      visitorLists.forEach((v: any)=> {
          if (visitorListsObj[v.type]) {
            visitorListsObj[v.type] = [ ...visitorListsObj[v.type], v ]
          } else {
            visitorListsObj[v.type] = [ v ]
          }
      })
      if(visitorListsObj.faculty) {
        visitorListsObj.faculty.forEach((data: any) => {
          const item = this.formBuilder.group({
            name: [data.name],
            type: [data.type],
            reg_id: [data.reg_id],
            contact_no: [data.contact_no],
            dept: [data.dept],
            email: [data.email]
          });
          this.faculty.push(item);
        });
      }
      if (visitorListsObj.student) {
        visitorListsObj.student.forEach((data: any) => {
          const item = this.formBuilder.group({
            name: [data.name],
            type: [data.type],
            reg_id: [data.reg_id],
            contact_no: [data.contact_no],
            dept: [data.dept],
            email: [data.email]
          });
          this.students.push(item);
        });
      } 
    } else {
    this.addFaculty();
    this.addStudents();
    }
  }

  public async getindustrialVisitById(id: string) {
    try {
      this.loading = true;
      let data: any = await this.industrialVisitService.getIndustrialVisitById(id)
      this.ivDetails = data;
      this.ivDetails.course_and_dept.split(',').forEach((dept: string)=> {       
        this.departments.push(DEPARTSMENTS.find((d)=> d.value === dept))
      })
      this.loading = false;
    } catch (error) {
      this.loading = false;
      console.error(error)
    }
  }

  async onSubmit(): Promise<void> {
    try {
      if (this.visitorsForm.valid) {
        this.loading = true;
        const { faculty, students } = this.visitorsForm.value;
        let payload = [...faculty, ...students];
        payload = payload.map((p) => ({
          ...p,
          institute: {
            id: this.userData.indIns.id,
          },
          industrialVisit: {
            id: this.ivId,
          },
        }));
  
        const visitorLists = this.ivDetails.instituteData.find((ins: any) => ins.id === this.userData?.indIns?.id)?.visitors || [];
        
        const deletePromises: Promise<any>[] = [];
        const updatePromises: Promise<any>[] = [];
  
        visitorLists.forEach((visitor: any) => {
          if (this.removedEmails.includes(visitor.email)) {
            deletePromises.push(this.visitorService.deleteVisitor(visitor.id));
          }
  
          payload.forEach((data, index: number) => {
            if (visitor.email === data.email) {
              updatePromises.push(this.visitorService.updateVisitor(data, visitor.id));
              payload.splice(index, 1);
            }
          });
        });
  
        // Wait for all delete and update operations to complete
        await Promise.all([...deletePromises, ...updatePromises]);
  
        if (payload.length > 0) {
          await this.visitorService.createVisitors(payload);
        }
  
        this.router.navigate([`/industrial-visits/${this.ivId}`]);
        this.faculty.reset()
        this.students.reset()
        this.loading = false;
      } else {
        console.log("Form is invalid");
      }
    } catch (error) {
      console.log("Visitor Form Error >>>>", error);
      this.loading = false;
    }
  }
  
}
