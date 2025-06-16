import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { WEBSITE_BASE_URL } from '../../constance/WEBSITE_BASE_URL';

interface BalanceResponse {
  balance: number;
}

interface Transaction {
  created_at: Date;
  phone_number: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
}

@Injectable({
  providedIn: 'root',
})
export class LawyerService {
  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true',
    });
  }

  // ? Clients Chats
  //! get all clients
  getChats(): Observable<any> {
    return this.http.get(`${WEBSITE_BASE_URL}lawyers/me/client-chats`, {
      headers: this.getHeaders(),
    });
  }

  //! send message
  sendMessage(chat_id: number, message: string): Observable<any> {
    return this.http.post(
      `${WEBSITE_BASE_URL}chats/${chat_id}/lawyer-response?response=${encodeURIComponent(
        message
      )}`,
      {},
      { headers: this.getHeaders() }
    );
  }

  // ? Balance
  // ! get Lawyer balance
  getBalance(): Observable<number> {
    return this.http.get<number>(`${WEBSITE_BASE_URL}lawyers/balance`, {
      headers: this.getHeaders(),
    });
  }

  // ! get paid
  getPaid(phone_number: string, amount: number): Observable<any> {
    return this.http.post(
      `${WEBSITE_BASE_URL}lawyers/withdraw`,
      { phone_number, amount },
      { headers: this.getHeaders() }
    );
  }

  // ! Get Paid History
  getPaidHistory(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${WEBSITE_BASE_URL}lawyers/withdrawal-requests`, {
      headers: this.getHeaders(),
    });
  }
}
