import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  constructor(private http: HttpClient) {}

  getReservations(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/reservations`);
  }

  createReservation(data: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/reservations`, data);
  }

  cancelReservation(id: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/reservations/${id}`);
  }
}