import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'

@Injectable({ providedIn: 'root' })
export class IndustrialVisitServiceApi {

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

  public async createIndustrialVisit(data: any) {
    const headers = await this.getHeaders(true);
    return await this.http.post(`http://localhost:3000/api/industrial-visit`, data, {headers}).toPromise()
  }

  public async getAllIndustrialVisit(limit: number, offset: number, filters: any = {}) {    
    const headers = await this.getHeaders();
    const filterQueryParams = Object.keys(filters).map((filterKey)=> `${filterKey}=${filters[filterKey]}`).join('&')
    const url = `http://localhost:3000/api/industrial-visit?offset=${offset}&limit=${limit}${filterQueryParams ? `&${filterQueryParams}` : ''}`;   
    return await this.http.get(url, {headers}).toPromise()
  }

  public async getIndustrialVisitById(id: string) {
    const headers = await this.getHeaders();
    const url = `http://localhost:3000/api/industrial-visit/${id}`;
    return await this.http.get(url, {headers}).toPromise()
  }

  public async getIndustryInstituteCount(filters: any = {}) {
    const headers = await this.getHeaders();
    const filterQueryParams = Object.keys(filters).map((filterKey)=> `${filterKey}=${filters[filterKey]}`).join('&')
    const url = `http://localhost:3000/api/ind-ins/count${filterQueryParams ? `?${filterQueryParams}` : ''}`;   
    return await this.http.get(url, {headers}).toPromise()
  }

  public async updateIndustrialVisit(data: any, id: string) {
    const headers = await this.getHeaders(true);
    const url = `http://localhost:3000/api/industrial-visit/${id}`
    return await this.http.patch(url, data, {headers}).toPromise()
  }

  public async deleteIndustrialVisit( id: string) {
    const headers = await this.getHeaders(true);
    const url = `http://localhost:3000/api/industrial-visit/${id}`
    return await this.http.delete(url, {headers}).toPromise()
  }
}


