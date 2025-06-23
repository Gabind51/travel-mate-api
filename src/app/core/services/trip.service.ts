import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Trip, TripSearchParams } from '../models/trip.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TripService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAllTrips(): Observable<Trip[]> {
    return this.http.get<Trip[]>(`${this.API_URL}/trips`);
  }

  getTripById(id: number): Observable<Trip> {
    return this.http.get<Trip>(`${this.API_URL}/trips/${id}`);
  }

  getTripsByUserId(userId: number): Observable<Trip[]> {
    return this.http.get<Trip[]>(`${this.API_URL}/users/${userId}/trips`);
  }

  searchTrips(params: TripSearchParams): Observable<Trip[]> {
    let httpParams = new HttpParams();
    if (params.query) {
      httpParams = httpParams.set('query', params.query);
    }
    return this.http.get<Trip[]>(`${this.API_URL}/trips/search`, { params: httpParams });
  }

  createTrip(trip: Trip): Observable<Trip> {
    return this.http.post<Trip>(`${this.API_URL}/trips`, trip);
  }

  updateTrip(id: number, trip: Partial<Trip>): Observable<Trip> {
    return this.http.put<Trip>(`${this.API_URL}/trips/${id}`, trip);
  }

  deleteTrip(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/trips/${id}`);
  }

  deleteMultipleTrips(ids: number[]): Observable<any> {
    return this.http.delete(`${this.API_URL}/trips`, { body: { ids } });
  }

  updateMultipleTrips(ids: number[], update: Partial<Trip>): Observable<any> {
    return this.http.put(`${this.API_URL}/trips`, { ids, update });
  }
}