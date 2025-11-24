import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { IndustrialVisitServiceApi } from '../services/industrial-visit-api.service';
import { CommonModule } from '@angular/common';
import dayjs from 'dayjs';
import { checkDate, dateOptions, DEPARTSMENTS, GROUPS } from '../../config/config';
import { VisitorServiceApi } from '../services/visitors-api.service';
import { sortBy } from 'lodash';
import { LoaderComponent } from '../loader/loader.component';

@Component({
  selector: 'app-industrial-visit-details',
  standalone: true,
  imports: [ CommonModule, RouterLink, RouterOutlet,
    LoaderComponent
   ],
  templateUrl: './industrial-visit-details.component.html',
  styleUrl: './industrial-visit-details.component.scss'
})
export class IndustrialVisitDetailsComponent {
  public loading: boolean = false;
  public error = '';
  public ivDetails: any = {};
  public ivId = '';
  public ivDetailsObjectKeys: string[] = [];
  public labelSelection: any = {
    course_and_dept: 'Departments',
    no_of_students: 'No.of Students',
    no_of_faculty: 'No.of Faculty',
    contact_person: 'Contact Person',
    contact_no: 'Contact No',
    alternative_contact_no: 'Alternative Contact No',
    food_provide: 'Food Provide',
    available_institute: 'Total Institutions Permitted',
    location: 'Location',
    start_date: 'Start Date',
    end_date: 'End Date'
  };
  public visitorLabelSelection: any = {
    name: 'Name',
    reg_id: 'Registration ID',
    email: 'Email',
    dept: 'Departments',
    contact_no: 'Contact No',
    comments: 'Comments'
  };
  public visitorKeys = [ 'name', 'reg_id', 'email', 'dept', 'contact_no', 'comments' ]
  public userData: any = {};
  public isIndustry = false;
  public showVisitors = false;
  public visitorListsObj: any = {};
  public activeId: string = '';
  public instituteActiveId: string = '';
  public instituteData: any[] = [];
  public isShowApply: any = true;

  constructor(
    private router: Router,
    private industrialVisitService: IndustrialVisitServiceApi,
    private visitorServiceApi: VisitorServiceApi,
  ) {}

  public async ngOnInit() {
    const splitUrl = this.router.url.split('/')
    this.ivDetailsObjectKeys = Object.keys(this.labelSelection);
    this.ivId = splitUrl[2];
    this.userData = localStorage.getItem('userData')
    this.userData = JSON.parse(this.userData)
    await this.getindustrialVisitById(splitUrl[2]);
    if (this.userData?.role === GROUPS.INDUSTRY) {
      this.isIndustry = true;
    }
  
    this.isShowApply = this.checkDateComparison(this.ivDetails.start_date, { checkBefore: true });
  }

  public async getindustrialVisitById(id: string) {
    try {
      this.loading = true;
      let data: any = await this.industrialVisitService.getIndustrialVisitById(id)
      this.ivDetails = {
        ...data,
        start_date: dayjs(data.start_date).format('DD-MM-YYYY'),
        end_date: dayjs(data.end_date).format('DD-MM-YYYY'),
        course_and_dept: data.course_and_dept.split(',').map((dept: any)=> DEPARTSMENTS.find((f)=> f.value === dept)?.label).join(', '),
        food_provide: !data.food_provide ? 'No' : 'Yes',
        disabled: data.available_institute === data.instituteData.length
      };
      if (this.userData?.role === GROUPS.INDUSTRY) {
        this.instituteData = this.ivDetails.instituteData.map((institute: any)=> {         
          let visitorListsObj: any = {};
          let visitors = sortBy(institute?.visitors, ['reg_id'])
          visitors?.forEach((v: any)=> {           
            const dept = DEPARTSMENTS.find((d)=> d.value === v.dept)?.label
            if (visitorListsObj[v.type]) {
              visitorListsObj[v.type] = [ ...visitorListsObj[v.type], { ...v, dept } ]
            } else {
              visitorListsObj[v.type] = [ {...v, dept} ]
            }
        })
        delete institute?.visitors;
        return {
          ...institute,
          visitorListsObj
        }
        })
      }
      if (this.userData?.role === GROUPS.INSTITUE) {
        const visitorLists = sortBy(this.ivDetails.instituteData.find((ins: any)=> ins.id === this.userData?.indIns?.id)?.visitors, ['reg_id']);
        this.showVisitors = visitorLists.length > 0;
        visitorLists.forEach((v: any)=> {
            const dept = DEPARTSMENTS.find((d)=> d.value === v.dept)?.label
            if (this.visitorListsObj[v.type]) {
              this.visitorListsObj[v.type] = [ ...this.visitorListsObj[v.type], { ...v, dept } ]
            } else {
              this.visitorListsObj[v.type] = [ {...v, dept} ]
            }
        })
      }
      this.loading = false;
    } catch (error) {
      this.loading = false;
      console.error(error)
    }
  }

  public handleRoute() {
    // /institute/industrial-visits', ivDetails.id, 'apply'
    if(this.userData) {
      this.router.navigate([`/institute/industrial-visits/${this.ivDetails.id}/apply`])
    } else {
      this.router.navigate(['/login'], { queryParams: { action: 'signin', redirectTo: `/institute/industrial-visits/${this.ivDetails.id}/apply` } });
    }
  }

  public rowClick(id: string) {
    this.activeId = this.activeId !== id ? id : ''
  }

  public instituteRowClick(id: string){
    this.instituteActiveId = this.instituteActiveId !== id ? id : ''
  }

  public async handleAttend(id: string, attend: boolean) {
    try {
      this.loading = true;
      const getVisitorDetails = await this.visitorServiceApi.getVisitorById(id) as any;
      const payload = {
        attend,
        allowToFeedback: attend
      }
      await this.visitorServiceApi.updateVisitor(payload, id).then(async ()=> {
        if (getVisitorDetails) {
          getVisitorDetails
        }
        if (attend) {
          await this.visitorServiceApi.sendFeedbackNotification(id);
          this.loading = false;
        }
      })
      this.getindustrialVisitById(this.ivId);
    } catch (error: any) {
      this.error = error?.error
      this.loading = false;
    }
  }
  
  public checkDateComparison(date: string, obj: dateOptions): boolean {
    return checkDate(date, obj);
  }

}
