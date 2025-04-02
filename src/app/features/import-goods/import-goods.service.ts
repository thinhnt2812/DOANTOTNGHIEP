import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ImportGoodsService {
  private apiUrl = 'http://localhost:5000/import_goods';

  constructor(private http: HttpClient) {}

  getImportGoods(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  addImportGood(importGood: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, importGood);
  }

  updateImportGood(importGood: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${importGood.id}`, importGood);
  }

  deleteImportGood(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
