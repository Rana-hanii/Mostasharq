// import { ILawyer } from './user-chats.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { WEBSITE_BASE_URL } from '../../constance/WEBSITE_BASE_URL';
import { Ilawyer } from '../../interfaces/ILawyer';



@Injectable({
  providedIn: 'root',
})
export class UserChatsService {
  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true',
    });
  }

  // ! get all governorates in dropdown list
  getGovernorates(): Observable<string[]> {
    return this.http.get<string[]>(`${WEBSITE_BASE_URL}governorates`, {
      headers: this.getHeaders(),
    });
  }

  //! display  all lawyers in this governorat
  getLawyers(governorate: string): Observable<Ilawyer[]> {
    return this.http.get<Ilawyer[]>(
      `${WEBSITE_BASE_URL}lawyers/by-governorate/${governorate}`,
      { headers: this.getHeaders() }
    );
  }


  // !choose lawyer
  chooseLawyer(lawyer_id: number): Observable<any> {
    return this.http.post(`${WEBSITE_BASE_URL}chats/with-lawyer`, { lawyer_id }, { headers: this.getHeaders() });
  }
 

//! lawyer and user chat

  //! get all lawyers which user chat with
  getChats(): Observable<any> {
    return this.http.get(`${WEBSITE_BASE_URL}users/me/lawyer-chats`, { headers: this.getHeaders() });
  }


  //! chat
  


  //! send message
  sendMessage(chat_id: number, message: string): Observable<any> {
    return this.http.post(
      `${WEBSITE_BASE_URL}chats/${chat_id}/messages?message=${encodeURIComponent(message)}`,
      {},
      { headers: this.getHeaders() }
    );
  }
 

// !get chat
  getChatFull(chat_id: number): Observable<any> {
    return this.http.get(`${WEBSITE_BASE_URL}chats/${chat_id}/full`, { headers: this.getHeaders() });
  }


}
