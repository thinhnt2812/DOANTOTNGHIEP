import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OrderManagementService {
  private apiUrl = 'http://localhost:5000/orders';

  constructor(private http: HttpClient) {}

  getOrder(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}
