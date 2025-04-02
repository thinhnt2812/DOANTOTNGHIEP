import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private apiUrl = 'http://localhost:5000/accounts';

  constructor(private http: HttpClient) {}

  getAccounts(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  addAccount(account: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, account);
  }

  updateAccount(account: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${account.id}`, account);
  }

  deleteAccount(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
