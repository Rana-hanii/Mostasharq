import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { WEBSITE_BASE_URL } from '../../constance/WEBSITE_BASE_URL';

interface PaymentInitResponse {
  payment_url: string;
}

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders ({
      'Authorization': `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true'
    });
  }

  initiatePayment(plan_name: string, user_id: number): Observable<PaymentInitResponse> {
    const body = { plan_name, user_id };
    return this.http.post<PaymentInitResponse>(
      `${WEBSITE_BASE_URL}payments/initiate`,
      body,
      { headers: this.getHeaders() }
    );
  }
}
