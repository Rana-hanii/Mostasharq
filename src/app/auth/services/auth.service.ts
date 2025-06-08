import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { WEBSITE_BASE_URL } from '../../core/constance/WEBSITE_BASE_URL';

interface IProfile {
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  user_id: number;
  role: string;
  created_at: string;
}

interface SignUpResponse {
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  user_id: number;
  role: string;
  created_at: string;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
  user_id: number;
  user_role: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private userRole: string | null = null;

  constructor() {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true',
    });
  }

  // Get user role
  getUserRole(): string | null {
    if (this.userRole) {
      return this.userRole;
    }
    const role = localStorage.getItem('role');
    if (role) {
      this.userRole = role;
      return role;
    }
    return null;
  }

  // Set user role
  setUserRole(role: string): void {
    this.userRole = role;
  }

  // !sign up
  sendSignUp(data: object): Observable<SignUpResponse> {
    return this.http
      .post<SignUpResponse>(`${WEBSITE_BASE_URL}register`, data)
      .pipe(
        tap((response) => {
          if (response.user_id) {
            localStorage.setItem('user_id', response.user_id.toString());
          }
        })
      );
  }

  // !login
  sendLogin(data: FormData): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${WEBSITE_BASE_URL}login`, data).pipe(
      tap((response) => {
        if (response.access_token) {
          localStorage.setItem('token', response.access_token);
        }
        if (response.user_id) {
          localStorage.setItem('user_id', response.user_id.toString());
        }
        if (response.user_role) {
          localStorage.setItem('role', response.user_role);
          this.setUserRole(response.user_role);
        }
      })
    );
  }

  // !logout
  logout(): Observable<any> {
    return this.http
      .post(`${WEBSITE_BASE_URL}logout`, {}, { headers: this.getHeaders() })
      .pipe(
        tap(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user_id');
          this.userRole = null;
        })
      );
  }

  // !get profile
  getUserData(): Observable<IProfile> {
    const userId = localStorage.getItem('user_id');
    return this.http
      .get<IProfile>(`${WEBSITE_BASE_URL}users/me?user_id=${userId}`, {
        headers: this.getHeaders(),
      })
      .pipe(
        tap((userData) => {
          this.setUserRole(userData.role);
        })
      );
  }

  // !update user data
  updateUserData(data: object): Observable<any> {
    return this.http.put(`${WEBSITE_BASE_URL}users/me`, data, {
      headers: this.getHeaders(),
    });
  }

  // !change password
  changePassword(data: object): Observable<any> {
    return this.http.post(`${WEBSITE_BASE_URL}users/me/change-password`, data, {
      headers: this.getHeaders(),
    });
  }

  // !delete account
  deleteAccount(): Observable<any> {
    return this.http
      .post(`${WEBSITE_BASE_URL}logout`, {}, { headers: this.getHeaders() })
      .pipe(
        tap(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user_id');
          this.userRole = null;
        })
      );
  }
}
