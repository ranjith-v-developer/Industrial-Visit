import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginRegisterComponent } from './components/login-register/login-register.component';
import { BaseLayoutComponent } from './base-layout/base-layout.component';
import { IndustryInstitueRequestComponent } from './industry-institue-request/industry-institue-request.component';
import { GROUPS } from '../config/config';
import { RoleGuard } from './services/auth/auth-guard.service';
import { IndustrialVisitListComponent } from './industrial-visit-list/industrial-visit-list.component';
import { IndustrialVisitEditComponent } from './industrial-visit-edit/industrial-visit-edit.component';
import { IndustrialVisitDetailsComponent } from './industrial-visit-details/industrial-visit-details.component';
import { IndustrialVisitApplyComponent } from './industrial-visit-apply/industrial-visit-apply.component';
import { IndustrialVisitListCardComponent } from './industrial-visit-list-card/industrial-visit-list-card.component';
import { IvFeedbackFormComponent } from './iv-feedback-form/iv-feedback-form.component';
import { DashboardComponent } from './dashboard/dashboard.component';


export const routes: Routes = [
    { 
        path: '',
        redirectTo: '/home',
        pathMatch: 'full',
    },
    {
        path: '',
        component: BaseLayoutComponent,
        children: [
            { 
                path: 'home',
                component: HomeComponent,
            },
            {   path: 'login', 
                component: LoginRegisterComponent
            },
            {
                path: 'industry-institue-request',
                component: IndustryInstitueRequestComponent,
                canActivate: [RoleGuard],
                data: { groups: [GROUPS.SUPPORT] }
            },
            {
                path: 'industrial-visits/:id',
                component: IndustrialVisitDetailsComponent,
            },
            {
                path: 'industrial-visits',
                component: IndustrialVisitListComponent,
            },
            {
                path: 'industry',
                children: [
                    {
                        path: 'dashboard',
                        component: DashboardComponent,
                        canActivate: [RoleGuard],
                        data: { groups: [GROUPS.INDUSTRY] }
                    },
                    {
                        path: 'industrial-visits',
                        component: IndustrialVisitListComponent,
                        canActivate: [RoleGuard],
                        data: { groups: [GROUPS.INDUSTRY] }
                    },
                    {
                        path: ':id/industrial-visits',
                        component: IndustrialVisitListCardComponent,
                    },
                    {
                        path: 'industrial-visits/create',
                        component: IndustrialVisitEditComponent,
                        canActivate: [RoleGuard],
                        data: { groups: [GROUPS.INDUSTRY] }
                    },
                    {
                        path: 'industrial-visits/:id/modify',
                        component: IndustrialVisitEditComponent,
                        canActivate: [RoleGuard],
                        data: { groups: [GROUPS.INDUSTRY] }
                    },
                    {
                        path: 'iv/:ivId/visitor/:visitorId',
                        component: IvFeedbackFormComponent,
                    }
                ]
            },
            {
                path: 'institute',
                children: [
                    {
                        path: 'dashboard',
                        component: DashboardComponent,
                        canActivate: [RoleGuard],
                        data: { groups: [GROUPS.INSTITUE] }
                    },
                    {
                        path: 'industrial-visits',
                        component: IndustrialVisitListComponent,
                        canActivate: [RoleGuard],
                        data: { groups: [GROUPS.INSTITUE] }
                    },
                    {
                        path: 'industrial-visits/applied',
                        component: IndustrialVisitListComponent,
                        canActivate: [RoleGuard],
                        data: { groups: [GROUPS.INSTITUE] }
                    },
                    {
                        path: 'industrial-visits/:id/apply',
                        component: IndustrialVisitApplyComponent,
                        canActivate: [RoleGuard],
                        data: { groups: [GROUPS.INSTITUE] }
                    },
                    {
                        path: 'industrial-visits/:id/modify',
                        component: IndustrialVisitApplyComponent,
                        canActivate: [RoleGuard],
                        data: { groups: [GROUPS.INSTITUE] }
                    },
                ]
            }
        ] 
    },   
];
