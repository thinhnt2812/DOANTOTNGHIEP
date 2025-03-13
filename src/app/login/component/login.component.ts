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
  showPassword: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  login() {
    if (!this.loginname || !this.password) {
      this.errorMessage = 'Bạn chưa nhập tài khoản, mật khẩu';
      return;
    }
    this.authService.login(this.loginname, this.password).subscribe({
      next: (user) => {
        if (user.role === 'Admin') {
          this.router.navigate(['/admin']);
        } else if (user.role === 'User') {
          this.router.navigate(['/user']);
        }
      },
      error: () => this.errorMessage = 'Tên đăng nhập hoặc mật khẩu không chính xác'
    });
  }
}
