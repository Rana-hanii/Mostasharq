import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { WEBSITE_BASE_URL } from '../../constance/WEBSITE_BASE_URL';

export interface OrderPayload {
  order_type: string;
  description: string;
  database_schema: any;
  training_data: any;
}

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly http = inject(HttpClient);

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true'
    });
  }

  //! click to order system
  Order(payload: OrderPayload): Observable<any> {
    return this.http.post<any>(
      `${WEBSITE_BASE_URL}model/orders`,
      payload,
      { headers: this.getHeaders() }
    )
  }

 //! Order status
  getOrderStatus(orderId: number, status: string): Observable<any> {
    let params = new HttpParams();
    params = params.append('order_id', orderId.toString());
    params = params.append('status', status);

    return this.http.get<any>(
      `${WEBSITE_BASE_URL}model/orders`,
      { headers: this.getHeaders(), params: params }
    )
  }

}
