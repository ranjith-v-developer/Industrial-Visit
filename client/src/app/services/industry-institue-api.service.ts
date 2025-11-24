import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'

@Injectable({ providedIn: 'root' })
export class IndustryInstituteServiceApi {

  constructor(
    private http: HttpClient
  ) { }

  private async getHeaders(withToken: boolean = false) {
    const token = localStorage.getItem('access_token') || '';
    const headers = {
     ...withToken ? { Authorization: `Bearer ${token}` } : {},
     'Content-Type': 'application/json',
   }
   return headers;
  }

  public async createIndustryInstitute(data: any) {
    const headers = await this.getHeaders();
    return await this.http.post(`http://localhost:3000/api/ind-ins`, data, {headers}).toPromise()
  }

  public async updateIndustryInstitute(data: any, id: string, isVerification: boolean = false) {
    const headers = await this.getHeaders(true);
    const url = !isVerification ? `http://localhost:3000/api/ind-ins/${id}` : `http://localhost:3000/api/ind-ins/verification/${id}`
    return await this.http.patch(url, data, {headers}).toPromise()
  }

  
  public async getAllIndustryInstitute(limit: number, offset: number, filters: any = {}) {
    const headers = await this.getHeaders();
    const filterQueryParams = Object.keys(filters).map((filterKey)=> `${filterKey}=${filters[filterKey]}`).join('&')
    const url = `http://localhost:3000/api/ind-ins?offset=${offset}&limit=${limit}${filterQueryParams ? `&${filterQueryParams}` : ''}`;
    return await this.http.get(url, {headers}).toPromise()
  }

  public async getIndustryInstituteById(id: string) {
    const headers = await this.getHeaders();
    const url = `http://localhost:3000/api/ind-ins/${id}`;
    return await this.http.get(url, {headers}).toPromise()
  }

  public async getIndustryInstituteCount(filters: any = {}) {
    const headers = await this.getHeaders();
    const filterQueryParams = Object.keys(filters).map((filterKey)=> `${filterKey}=${filters[filterKey]}`).join('&')
    const url = `http://localhost:3000/api/ind-ins/count${filterQueryParams ? `?${filterQueryParams}` : ''}`;   
    return await this.http.get(url, {headers}).toPromise()
  }
}


