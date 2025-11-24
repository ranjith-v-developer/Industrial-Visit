import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'

@Injectable({ providedIn: 'root' })
export class CommonService {

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

    public async dashboardAPI(data: any) {
        const headers = await this.getHeaders(true);
        return await this.http.post(`http://localhost:3000/api/chart`, data, {headers}).toPromise()
    }
}