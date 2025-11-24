import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IndustrialVisitServiceApi } from '../../services/industrial-visit-api.service';
import { CommonModule } from '@angular/common';
import { checkDate, DEPARTSMENTS, getRandomRGBColor } from '../../../config/config';
import dayjs from 'dayjs';
import { LoaderComponent } from '../../loader/loader.component';

@Component({
  selector: 'home',
  standalone: true,
  imports: [
    CommonModule, LoaderComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  public loading = false;
  public companyBased: any[] = [];
  public departmentBased: any = {};
  public deptKey: string[] = [];
  public departments: any = {};
  public limit = 100;
  public offset = 0;

  constructor(
    private router: Router,
    private industrialVisitService: IndustrialVisitServiceApi,
  ) {}

  public async ngOnInit() {
    this.loading = true;
    try {
      DEPARTSMENTS.map((dept)=> {
        this.departments[dept.value] = dept.label
      })
      const data = await this.fetchIndustrialVisits();
      if (data?.length) {
        this.processIndustryData(data);
        this.processDepartmentData(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      this.loading = false;
    }
  }

  private async fetchIndustrialVisits() {
    try {
      let data = await this.industrialVisitService.getAllIndustrialVisit(this.limit, this.offset) as any[];
      data = data.filter((d)=> checkDate(dayjs(d.start_date).format('DD-MM-YYYY'), { checkBefore: true }));
      return data;
    } catch (error) {
      return [];
    }
  }

  private processIndustryData(data: any[]) {
    const industryGroups = this.groupByIndustry(data);
    this.companyBased = this.buildCompanyBasedData(industryGroups);
  }

  private groupByIndustry(data: any[]) {
    return data.reduce((acc, { industry, ...iv }) => {
      const industryName = industry.name;
      if (!acc[industryName]) acc[industryName] = [];
      acc[industryName].push({ ...iv, industryId: industry.id });
      return acc;
    }, {});
  }

  private buildCompanyBasedData(industryGroups: { [key: string]: any[] }) {
    return Object.keys(industryGroups).map(industryName => {
      const industryData = industryGroups[industryName].filter((d)=> checkDate(dayjs(d.start_date).format('DD-MM-YYYY'), { checkBefore: true }));
      return {
        industryId: industryData[0]?.industryId || '',
        name: industryName,
        ivCount: industryData.length,
        totalAppliedInstitute: industryData.flatMap(d => d.instituteData).length,
        bgColor: getRandomRGBColor('light-dark')
      };
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
        bgColor: getRandomRGBColor('light-dark')
      }));
      return acc;
    }, {});
  }

  public handleRedirect(type: string, id: string) {
    if (type === 'iv') {
      this.router.navigate([`/industrial-visits/${id}`])
    } else {
      this.router.navigate([`/industry/${id}/industrial-visits`])
    }
  }
}
