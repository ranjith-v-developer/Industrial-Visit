import { CommonModule } from '@angular/common';
import { Component, inject, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { ActivatedRoute, Router } from '@angular/router';
import { IndustryInstituteServiceApi } from '../../services/industry-institue-api.service';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { IndInsRequestPopupComponent } from '../../ind-ins-request-popup/ind-ins-request-popup.component';
import { UserServiceApi } from '../../services/user-api.service';
import { capitalize, omit } from 'lodash';
import { LoaderComponent } from '../../loader/loader.component';
import { GROUPS } from '../../../config/config';

@Component({
  selector: 'app-login-register',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule, 
    MatRadioModule, MatSelectModule, MatDialogModule,
    LoaderComponent
  ],
  templateUrl: './login-register.component.html',
  styleUrl: './login-register.component.scss'
})
export class LoginRegisterComponent {
  public actionParam: string = '';
  public loginForm: FormGroup;
  public registerForm: FormGroup;
  public roles: any = [
    { name: 'Industry', value: 'industry' },
    { name: 'Institute', value: 'institute' }
  ]
  public getIndustryInstituteDetails: any = []
  public industryInstituteList: any = []
  public limit: number = 1000;
  public offset: number = 0;
  public sort: string = 'name@ASC';
  public loading: boolean = false;
  private modalService = inject(MatDialog)
  public error = '';
  public redirectTo: string = '/dashboard';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private industryInstituteService: IndustryInstituteServiceApi,
    private userServiceApi: UserServiceApi
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });

    this.registerForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      ph_no: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      password: ['', [Validators.required, Validators.minLength(5)]],
      role: ['institute', [Validators.required]],
      indIns: ['', [Validators.required]]
    });
  }

  public async ngOnInit() {
    if (localStorage.getItem('userData')) {
      this.router.navigate(['/home']).then(() => {
        window.location.reload();
      });
    }
    this.route.queryParamMap.subscribe(params => {
      this.actionParam = params.get('action') || '';
      this.redirectTo = params.get('redirectTo') || '';
    });   
    await this.getAllIndustryInstitute(); 
    this.industryInstituteList = this.getIndustryInstituteDetails.filter((data: any)=> data.type === 'institute');
    this.registerForm.get('role')?.valueChanges.subscribe((value) => {
      this.industryInstituteList = this.getIndustryInstituteDetails.filter((data: any)=> data.type === value);     
    });
  }

  public async getAllIndustryInstitute() {
    this.loading = true;
    const filters: any = {}
    filters.sort = 'name@ASC';
    filters.status = 'approved';
    await this.industryInstituteService.getAllIndustryInstitute(this.limit, this.offset, filters).then((res: any)=> {
      this.loading = false;
      this.getIndustryInstituteDetails = res;
    }).catch((e)=> {
      this.loading = false;
      this.getIndustryInstituteDetails = [];
    })
  }

  public ngOnChanges(changes: SimpleChanges): void {   
  }

  public search(event: any) {
    const value = event.target.value.toLowerCase();
    this.industryInstituteList = this.getIndustryInstituteDetails.filter((indIns: any) => indIns.name.toLowerCase().indexOf(value) > -1 && indIns.type === this.registerForm.get('role')?.value);
  }

  public async loginSubmit() {
    this.error = '';
    let redirectPath = '/home'
    if (this.loginForm.valid) {
      this.loading = true;
      await this.userServiceApi.login(this.loginForm.value).then((result: any)=> {
        localStorage.setItem('userData', JSON.stringify(omit(result, ['access_token'])))
        localStorage.setItem('access_token', result.access_token)
        this.loading = false;
        this.loginForm.reset('');
        if ([ GROUPS.INDUSTRY, GROUPS.INSTITUE ].includes(result.role)) {
          redirectPath = `/${result.role}/dashboard`
        }
        if (this.redirectTo) {
          redirectPath = this.redirectTo
        }
        this.router.navigate([redirectPath]).then(() => {
          window.location.reload();
        });
      }).catch((e)=>{
        this.loading = false;
        this.error = capitalize(e?.error?.errors?.email || e?.error?.errors?.User || '')
      })
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  public async registerSubmit() {
    this.error = '';
    let redirectPath = '/home'
    if (this.registerForm.valid) {
      this.loading = true;
     await this.userServiceApi.register({ ...this.registerForm.value, indIns: { id: this.registerForm.value.indIns } }).then((result: any)=> {
      localStorage.setItem('userData', JSON.stringify(omit(result, ['access_token'])))
      localStorage.setItem('access_token', result.access_token)
      this.loading = false;
      this.registerForm.reset('')
      if ([ GROUPS.INDUSTRY, GROUPS.INSTITUE ].includes(result.role)) {
        redirectPath = `/${result.role}/dashboard`
      }
      if (this.redirectTo) {
        redirectPath = this.redirectTo
      }
      this.router.navigate([redirectPath]).then(() => {
        window.location.reload();
      });
    }).catch((e)=>{
      this.loading = false;
      this.error = capitalize(e?.error?.errors?.email || '')
    })
    } else {
      this.registerForm.markAllAsTouched();
    }
  }

  public showpopup(){
    const modalRef = this.modalService.open(IndInsRequestPopupComponent, { autoFocus: false });
    modalRef.afterOpened().subscribe(result => {
      console.log(`Dialog opened result: ${result}`);
    });
    modalRef.afterClosed().subscribe(async result => {
      console.log(`Dialog closed result: ${result}`);
      await this.getAllIndustryInstitute();
    });
}

}
