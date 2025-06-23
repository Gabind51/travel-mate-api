import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.API_URL}/users`);
  }

  updateUser(id: number, userData: Partial<User>): Observable<any> {
    return this.http.put(`${this.API_URL}/users/${id}`, userData);
  }

  resetDatabase(): Observable<any> {
    return this.http.post(`${this.API_URL}/admin/reset`, {});
  }
}