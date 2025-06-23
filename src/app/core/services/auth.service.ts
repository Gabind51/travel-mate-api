import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = environment.apiUrl;
  private currentUserSignal = signal<User | null>(null);
  
  currentUser = this.currentUserSignal.asReadonly();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadUserFromToken();
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    const formData = new FormData();
    formData.append('email', credentials.email);
    formData.append('password', credentials.password);

    return this.http.post<AuthResponse>(`${this.API_URL}/login`, formData).pipe(
      tap(response => {
        this.setToken(response.token);
        this.loadUserFromToken();
      })
    );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    const formData = new FormData();
    formData.append('name', userData.name);
    formData.append('email', userData.email);
    formData.append('password', userData.password);

    return this.http.post<AuthResponse>(`${this.API_URL}/register`, formData).pipe(
      tap(response => {
        this.setToken(response.token);
        this.loadUserFromToken();
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  }

  isAdmin(): boolean {
    return this.currentUser()?.isAdmin || false;
  }

  private setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  private loadUserFromToken(): void {
    const token = this.getToken();
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp > Date.now() / 1000) {
        this.currentUserSignal.set({
          id: payload.user_id,
          name: payload.user_name,
          email: '', // Email not in JWT payload
          isAdmin: payload.is_admin
        });
      }
    } catch (error) {
      console.error('Error parsing token:', error);
      this.logout();
    }
  }
}