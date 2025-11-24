import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'

@Injectable({ providedIn: 'root' })
export class ChatbotServiceApi {

  constructor(
    private http: HttpClient
  ) { }

  private async getHeaders() {
    const headers = {
     'Content-Type': 'application/json',
    }
   return headers;
  }

  public async chatbotRequest(filters: any) {
    const headers = await this.getHeaders();
    const filterQueryParams = Object.keys(filters).map((filterKey)=> `${filterKey}=${filters[filterKey]}`).join('&')
    const url = `http://localhost:3000/api/predict?${filterQueryParams}`;   
    return await this.http.get(url, {headers}).toPromise()
  }

  
}
