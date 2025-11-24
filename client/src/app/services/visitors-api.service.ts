import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'

@Injectable({ providedIn: 'root' })
export class VisitorServiceApi {

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

  public async createVisitors(data: any) {
    const headers = await this.getHeaders(true);
    return await this.http.post(`http://localhost:3000/api/visitor`, data, {headers}).toPromise()
  }
  
  public async getAllVisitors(limit: number, offset: number, filters: any = {}) {
    const headers = await this.getHeaders();
    const filterQueryParams = Object.keys(filters).map((filterKey)=> `${filterKey}=${filters[filterKey]}`).join('&')
    const url = `http://localhost:3000/api/visitor?offset=${offset}&limit=${limit}${filterQueryParams ? `&${filterQueryParams}` : ''}`;   
    return await this.http.get(url, {headers}).toPromise()
  }

  public async getVisitorById(id: string) {
    const headers = await this.getHeaders();
    const url = `http://localhost:3000/api/visitor/${id}`;
    return await this.http.get(url, {headers}).toPromise()
  }

  public async updateVisitor(data: any, id: string) {
    const headers = await this.getHeaders(true);
    const url = `http://localhost:3000/api/visitor/${id}`
    return await this.http.patch(url, data, {headers}).toPromise()
  }

  public async deleteVisitor( id: string) {
    const headers = await this.getHeaders(true);
    const url = `http://localhost:3000/api/visitor/${id}`
    return await this.http.delete(url, {headers}).toPromise()
  }

  public async sendFeedbackNotification( id: string) {
    const headers = await this.getHeaders(true);
    const url = `http://localhost:3000/api/visitor/${id}/feedback-notification`
    return await this.http.post(url, {}, {headers}).toPromise()
  }

  public async feedbackSubmission( id: string, data: any) {
    const headers = await this.getHeaders(false);
    const url = `http://localhost:3000/api/visitor/${id}/feedback-submission`
    return await this.http.post(url, data, {headers}).toPromise()
  }
}


