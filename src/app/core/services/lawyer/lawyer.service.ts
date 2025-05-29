import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { WEBSITE_BASE_URL } from '../../constance/WEBSITE_BASE_URL';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LawyerService {

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true',
    });
  }

  //! get all lawyers which user chat with
  getChats(): Observable<any> {
    return this.http.get(`${WEBSITE_BASE_URL}lawyers/me/client-chats`, { headers: this.getHeaders() });
  }
  

    //! send message
    sendMessage(chat_id: number, message: string): Observable<any> {
      return this.http.post(
        `${WEBSITE_BASE_URL}chats/${chat_id}/lawyer-response?response=${encodeURIComponent(message)}`,
        {},
        { headers: this.getHeaders() }
      );
    }
   


 


}
