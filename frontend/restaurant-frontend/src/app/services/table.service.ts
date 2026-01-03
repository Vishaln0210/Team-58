import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Table } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class TableService {
  constructor(private http: HttpClient) {}

  getAllTables(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/tables`);
  }

  getAvailableTables(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/tables/available`);
  }

  createTable(tableData: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/tables`, tableData);
  }

  updateTable(id: number, tableData: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}/tables/${id}`, tableData);
  }

  deleteTable(id: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/tables/${id}`);
  }

  seatCustomer(id: number, customerName: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/tables/${id}/seat`, { customer_name: customerName });
  }

  vacateTable(id: number): Observable<any> {
    return this.http.post(`${environment.apiUrl}/tables/${id}/vacate`, {});
  }
}