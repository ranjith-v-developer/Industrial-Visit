import { Component } from '@angular/core';
import { LoaderComponent } from '../loader/loader.component';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { IndustrialVisitServiceApi } from '../services/industrial-visit-api.service';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import dayjs from 'dayjs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { checkDate, dateOptions, DEPARTSMENTS, GROUPS } from '../../config/config';

@Component({
  selector: 'app-industrial-visit-list',
  standalone: true,
  imports: [
    LoaderComponent, MatTableModule, CommonModule,
    MatIconModule, RouterLink, RouterOutlet,
    MatTooltipModule
  ],
  templateUrl: './industrial-visit-list.component.html',
  styleUrl: './industrial-visit-list.component.scss'
})
export class IndustrialVisitListComponent {
  public apiError: string = '';
  public loading: boolean = true;
  public getIndustryVisitsDetails: any = []
  public limit: number = 1000;
  public offset: number = 0;
  public industryColumns: any[] = [
    { label: 'Name', value: 'name' },
    { label: 'Course & Dept', value: 'course_and_dept' },
    { label: 'No.of Students', value: 'no_of_students' },
    { label: 'No.of Faculty', value: 'no_of_faculty' },
    { label: 'Contact Person', value: 'contact_person' },
    { label: 'Contact No', value: 'contact_no' },
    { label: 'Food Provide', value: 'food_provide' },
    { label: 'Total Institutions Permitted', value: 'available_institute' },
    { label: 'Start Date', value: 'start_date' },
    { label: 'End Date', value: 'end_date' },
    { label: 'Location', value: 'location' },
    { label: 'Actions', value: 'actions' },
  ];
  public instituteColumns: any[] = [
    { label: 'Name', value: 'name' },
    { label: 'Course & Dept', value: 'course_and_dept' },
    { label: 'No.of Students', value: 'no_of_students' },
    { label: 'No.of Faculty', value: 'no_of_faculty' },
    { label: 'Total Institutions Permitted', value: 'available_institute' },
    { label: 'Balance Institute', value: 'balance_institute' },
    { label: 'Start Date', value: 'start_date' },
    { label: 'End Date', value: 'end_date' },
  ];
  public displayedColumns: any[] = [];
  public searchText = '';
  public userData: any = {};
  public isInstitute: boolean = false;
  public isAppliedLists = false;

  constructor(
    private industrialVisitService: IndustrialVisitServiceApi,
    private router: Router
  ) {   
    this.userData = localStorage.getItem('userData')
    this.userData = JSON.parse(this.userData)
    if (this.userData?.role === GROUPS.INSTITUE) {
      this.isInstitute = true;
      this.displayedColumns = this.instituteColumns;
      const splitUrl = this.router.url.split('/');
      this.isAppliedLists = splitUrl.includes('applied')
    } else if (this.userData?.role === GROUPS.INDUSTRY) {
      this.displayedColumns = this.industryColumns
    } else {
      this.displayedColumns = this.instituteColumns
    }
  }
  
  public async ngOnInit() {
    await this.getAllIndustrialVisit();
  }

  public async getAllIndustrialVisit() {
    this.loading = true;
    const filters: any = {}
    filters.q = this.searchText;
    filters.sort = 'createdAt@ASC';
    if (this.isInstitute && this.isAppliedLists) {
      filters.institute = this.userData.indIns.id;
    }
    if (this.userData?.role === GROUPS.INDUSTRY) {
      filters.industry = this.userData.indIns.id;
    }
    await this.industrialVisitService.getAllIndustrialVisit(this.limit, this.offset, filters).then((res: any)=> {
      this.loading = false;
      if (this.userData?.role === GROUPS.INDUSTRY) {
        this.getIndustryVisitsDetails = res.map((data: any)=> ({
          ...data, 
          start_date: dayjs(data.start_date).format('DD-MM-YYYY'), 
          end_date: dayjs(data.end_date).format('DD-MM-YYYY'),
          course_and_dept: data.course_and_dept.split(',').map((dept: any)=> DEPARTSMENTS.find((f)=> f.value === dept)?.label).join(', '),
          food_provide: !data.food_provide ? 'No' : 'Yes'
         }))
      } else {
        this.getIndustryVisitsDetails = res.filter((d: any)=> !this.isAppliedLists ? this.checkDateComparison(dayjs(d.start_date).format('DD-MM-YYYY'), { checkBefore: true }) : true).map((data: any)=> {
          return { 
            ...data, 
            start_date: dayjs(data.start_date).format('DD-MM-YYYY'), 
            end_date: dayjs(data.end_date).format('DD-MM-YYYY'),
            course_and_dept: data.course_and_dept.split(',').map((dept: any)=> DEPARTSMENTS.find((f)=> f.value === dept)?.label).join(', '),
            balance_institute: data.available_institute - data.instituteData.length,
            disabled: !this.isAppliedLists && data.instituteData.length >= data.available_institute,
           }
        })
      }
    }).catch((e)=> {
      this.loading = false;
      this.getIndustryVisitsDetails = [];
    })
  }

  public setSearch(event: any) {
    this.searchText = event.target.value;
  }

  public search(event: string) {
    if(event === 'close') this.searchText = '';
    this.getAllIndustrialVisit()
  }

  public async actions(action: string, index: number) {   
    if (action === 'details') {
      this.router.navigate([ `industrial-visits/${this.getIndustryVisitsDetails[index].id}` ])
    } else if (action === 'edit') {
      this.router.navigate([ `/industry/industrial-visits/${this.getIndustryVisitsDetails[index].id}/modify` ])
    } else {
      this.loading = true;
      await this.industrialVisitService.deleteIndustrialVisit(this.getIndustryVisitsDetails[index].id).then(async ()=> {
        this.loading = false;
        await this.getAllIndustrialVisit();
      }).catch((e)=> {
        this.loading = false;
        console.error(e);
      })
    }
  }

  public checkDateComparison(date: string, obj: dateOptions): boolean {
    return checkDate(date, obj);
  }

}
