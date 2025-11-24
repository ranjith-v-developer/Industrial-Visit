import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { UserServiceApi } from '../user-api.service';

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(private userServiceApi: UserServiceApi, private router: Router) {}

  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    const allowedRoles = next.data['groups'];
    const userRoles = await this.userServiceApi.getUser();
    const hasAccess = allowedRoles.includes(userRoles?.role);

    if (!hasAccess) {
      this.router.navigate(['/home']).then(()=>{
        window.location.reload();
      })
    }

    return hasAccess;
  }
}
