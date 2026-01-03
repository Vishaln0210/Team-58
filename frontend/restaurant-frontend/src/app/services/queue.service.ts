import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class QueueService {
  constructor(private http: HttpClient) {}

  getQueue(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/queue`);
  }

  joinQueue(data: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/queue/join`, data);
  }

  getMyPosition(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/queue/my-position`);
  }

  leaveQueue(): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/queue/leave`);
  }
}