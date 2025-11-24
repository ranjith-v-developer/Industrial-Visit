import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'

@Injectable({ providedIn: 'root' })
export class UserServiceApi {

  constructor(
    private http: HttpClient
  ) { }

  private async getHeaders() {
    // let token: string;
    
    // if(this.authService.isScreener() &&  getCookie('anonymous-access-token')?.length > 0) {
    //   token = getCookie('anonymous-access-token')
    // } else {  
    //   token = await this.authService.getIdToken();
    // }
    const headers = {
    //  Authorization: `Bearer ${token}`,
     'Content-Type': 'application/json',
   }
   return headers;
  }

  public async register(registerData: any) {
    const headers = await this.getHeaders();
    return await this.http.post(`http://localhost:3000/api/auth/signup`, registerData, {headers}).toPromise()
  }

  public async login(loginData: any) {
    const headers = await this.getHeaders();
    return await this.http.post(`http://localhost:3000/api/auth/login`, loginData, {headers}).toPromise()
  }

  public async getUserById(id: string) {
    const headers = await this.getHeaders();
    return await this.http.get(`http://localhost:3000/api/auth/user/${id}`, {headers}).toPromise()
  }

  public async getUser() {
    const getUserStorageData = localStorage.getItem('userData') && JSON.parse(localStorage.getItem('userData') || '')
    if (getUserStorageData) {
        return getUserStorageData
    }
    return null
  }
}


