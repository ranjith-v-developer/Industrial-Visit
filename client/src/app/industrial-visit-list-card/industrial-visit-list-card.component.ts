import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IndustrialVisitServiceApi } from '../services/industrial-visit-api.service';
import { getRandomRGBColor, DEPARTSMENTS, checkDate } from '../../config/config';
import { IndustryInstituteServiceApi } from '../services/industry-institue-api.service';
import dayjs from 'dayjs';
import { LoaderComponent } from '../loader/loader.component';

@Component({
  selector: 'app-industrial-visit-list-card',
  standalone: true,
  imports: [CommonModule, LoaderComponent],
  templateUrl: './industrial-visit-list-card.component.html',
  styleUrls: ['./industrial-visit-list-card.component.scss']
})
export class IndustrialVisitListCardComponent implements OnInit {
  public loading = false;
  public industryId: string = '';
  public industryDetails: any = {};
  public departmentBased: any = {};
  public deptKey: string[] = [];
  public departments: any = {};
  public limit = 5;
  public offset = 0;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private industrialVisitService: IndustrialVisitServiceApi,
    private industryInstituteService: IndustryInstituteServiceApi,
  ) {
    this.industryId = this.route.snapshot.paramMap.get('id') || '';
  }

  public async ngOnInit() {
    this.loading = true;
    try {
      DEPARTSMENTS.map((dept) => {
        this.departments[dept.value] = dept.label;
      });
      await this.fetchIndustryInstitute();
      const data = await this.fetchIndustrialVisits();
      if (data?.length) {
        this.processDepartmentData(data);
      } else {
        console.warn('No industrial visits found');
      }
    } catch (error) {
      console.error(error);
    } finally {
      this.loading = false;
    }
  }

  private async fetchIndustrialVisits() {
    const filters: any = {};
    filters.industry = this.industryId;
    let data = await this.industrialVisitService.getAllIndustrialVisit(this.limit, this.offset, filters) as any[];
    data = data.filter((d) => checkDate(dayjs(d.start_date).format('DD-MM-YYYY'), { checkBefore: true }));
    return data;
  }

  public async fetchIndustryInstitute() {
    await this.industryInstituteService.getIndustryInstituteById(this.industryId).then((res: any) => {
      this.industryDetails = res;
    });
  }

  private processDepartmentData(data: any[]) {
    const departments = this.extractDepartments(data);
    if (departments.length) {
      this.departmentBased = this.buildDepartmentBasedData(data, departments);
      this.deptKey = Object.keys(this.departmentBased);
    }
  }

  private extractDepartments(data: any[]) {
    const departments: string[] = [];
    data.forEach((ivData) => {
      ivData.course_and_dept.split(',').forEach((dept: string) => {
        if (!departments.includes(dept)) departments.push(dept);
      });
    });
    return departments;
  }

  private buildDepartmentBasedData(data: any[], departments: string[]) {
    return departments.reduce((acc: any, dept) => {
      const deptData = data.filter(ivData => ivData.course_and_dept.split(',').includes(dept));
      acc[dept] = deptData.map(ivData => ({
        ivId: ivData.id,
        ivTitle: ivData.name,
        industryName: ivData.industry.name,
        totalAllowedInstitute: ivData.available_institute,
        totalAppliedInstitute: ivData.instituteData.length,
        allowedFaculty: ivData.no_of_faculty,
        allowedStudents: ivData.no_of_students,
        bgColor: getRandomRGBColor('light-dark'),
      }));
      return acc;
    }, {});
  }

  public handleRedirect(type: string, id: string) {
    if (type === 'iv') {
      this.router.navigate([`/industrial-visits/${id}`]);
    }
  }
}
