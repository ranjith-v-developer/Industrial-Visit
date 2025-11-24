import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { IndustryInstituteServiceApi } from '../../services/industry-institue-api.service';
import { DEFAULT_NAVIGATIONS, INDUSTRY_NAVIGATIONS, INSTITUE_NAVIGATIONS } from '../../../config/config';

@Component({
  selector: 'header',
  standalone: true,
  imports: [RouterLink, RouterOutlet, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  public userData: any = {};
  public showRightMenu: boolean = false;
  public industryInstituteCount: number = 0;
  public navItems: any = [];

  constructor(
    private router: Router,
    private industryInstituteService: IndustryInstituteServiceApi,
  ) {}

  ngOnInit() {
    this.userData = localStorage.getItem('userData')
    this.userData = JSON.parse(this.userData)
    this.navItems = this.userData?.role === 'institute' ? INSTITUE_NAVIGATIONS : this.userData?.role === 'industry' ? INDUSTRY_NAVIGATIONS : DEFAULT_NAVIGATIONS
    this.getAllIndustryInstitute()
  }

  public async getAllIndustryInstitute() {
    const filters: any = {}
    filters.status = 'pending';
    await this.industryInstituteService.getIndustryInstituteCount(filters).then((res: any)=> {     
      this.industryInstituteCount = res.count;
    });
  }

  toogleShowRightMenu() {
    this.showRightMenu = !this.showRightMenu
  }

  logOut() {
    localStorage.removeItem('userData');
    localStorage.removeItem('access_token');
    this.router.navigate([ '/home' ]).then(()=> {
      window.location.reload()
    });
    this.toogleShowRightMenu()
  }

}
