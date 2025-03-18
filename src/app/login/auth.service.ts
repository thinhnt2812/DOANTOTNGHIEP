import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/accounts';

  constructor(private http: HttpClient) {}

  login(loginname: string, password: string): Observable<any> {
    return this.http.get<any[]>(`${this.apiUrl}?loginname=${loginname}&password=${password}`)
      .pipe(
        map(users => {
          if (users.length > 0 && users[0].status === 'Đang hoạt động') {
            localStorage.setItem('user', JSON.stringify(users[0]));
            return users[0];
          } else {
            throw new Error('Invalid credentials or inactive account');
          }
        })
      );
  }

  logout() {
    localStorage.removeItem('user');
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('user') !== null;                                                 
  }

  getUserName(): string {
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    return user ? user.accountowner : '';
  }

  getUserRole(): string {
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    return user ? user.role : '';
  }
}
