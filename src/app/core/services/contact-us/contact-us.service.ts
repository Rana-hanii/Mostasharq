import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { WEBSITE_BASE_URL } from '../../constance/WEBSITE_BASE_URL';

@Injectable({
  providedIn: 'root',
})
export class ContactUsService {
  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true',
    });
  }

  //! Start Chat
  startChat(): Observable<any> {
    return this.http.post(`${WEBSITE_BASE_URL}support/chat`, {}, { headers: this.getHeaders() });
  }

  //! send message
  sendMessage(chat_id: number, message: string): Observable<any> {
    return this.http.post(
      `${WEBSITE_BASE_URL}support/chat/${chat_id}/message?content=${encodeURIComponent(
        message
      )}`,
      {},
      { headers: this.getHeaders() }
    );
  }

  //! Get Chat History
  getHistory(): Observable<any> {
    return this.http.get(`${WEBSITE_BASE_URL}users/me/support-chats`, { headers: this.getHeaders() });
  }

  //! Get Single Chat Details
  getChat(chatId: number): Observable<any> {
    return this.http.get(`${WEBSITE_BASE_URL}chats/${chatId}/full`, { headers: this.getHeaders() });
  }

  //! End Chat
  endChat(chatId: number): Observable<any> {
    return this.http.put(`${WEBSITE_BASE_URL}chats/${chatId}/end`, {}, { headers: this.getHeaders() });
  }
}
