import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'cn_admin_token';
  private readonly NAME_KEY = 'cn_admin_name';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>('/api/auth/login', { email, password }).pipe(
      tap(res => {
        localStorage.setItem(this.TOKEN_KEY, res.token);
        localStorage.setItem(this.NAME_KEY, res.name);
      })
    );
  }

  register(name: string, email: string, password: string): Observable<any> {
    return this.http.post<any>('/api/auth/register', { name, email, password });
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.NAME_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getAdminName(): string {
    return localStorage.getItem(this.NAME_KEY) || 'Admin';
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
