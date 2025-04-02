import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/accounts';

  constructor(private http: HttpClient) {}

  /**
   * Gửi yêu cầu đăng nhập đến API và lưu thông tin người dùng nếu đăng nhập thành công.
   * @param loginname Tên đăng nhập của người dùng.
   * @param password Mật khẩu của người dùng.
   * @returns Observable chứa thông tin người dùng nếu đăng nhập thành công.
   */
  login(loginname: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { loginname, password })
      .pipe(
        map(user => {
          if (user && user.status === 'Đang hoạt động') {
            localStorage.setItem('user', JSON.stringify(user));  // Lưu thông tin vào LocalStorage
            return user;
          } else {
            throw new Error('Sai thông tin đăng nhập hoặc tài khoản đã bị khóa!');
          }
        })
      );
  }  

  /**
   * Đăng xuất người dùng bằng cách xóa thông tin trong localStorage.
   */
  logout() {
    localStorage.removeItem('user');
  }

  /**
   * Kiểm tra xem người dùng có đang đăng nhập hay không.
   * @returns true nếu người dùng đã đăng nhập, ngược lại false.
   */
  isLoggedIn(): boolean {
    return localStorage.getItem('user') !== null;                                                 
  }

  /**
   * Lấy tên người dùng từ thông tin đã lưu trong localStorage.
   * @returns Tên người dùng hoặc chuỗi rỗng nếu không có thông tin.
   */
  getUserName(): string {
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    return user ? user.accountowner : '';
  }

  /**
   * Lấy vai trò của người dùng từ thông tin đã lưu trong localStorage.
   * @returns Vai trò của người dùng hoặc chuỗi rỗng nếu không có thông tin.
   */
  getUserRole(): string {
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    return user ? user.role : '';
  }
}
