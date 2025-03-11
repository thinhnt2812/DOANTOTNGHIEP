import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginname: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    if (!this.loginname || !this.password) {
      this.errorMessage = 'Bạn chưa nhập tài khoản, mật khẩu';
      return;
    }
    this.authService.login(this.loginname, this.password).subscribe({
      next: () => this.router.navigate(['/admin']),
      error: () => this.errorMessage = 'Tên đăng nhập hoặc mật khẩu không chính xác'
    });
  }
}
