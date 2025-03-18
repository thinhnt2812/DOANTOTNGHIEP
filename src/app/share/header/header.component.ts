import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../login/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  userName: string | undefined;
  userRole: string | undefined; 

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.userName = this.authService.getUserName();
    this.userRole = this.authService.getUserRole(); 
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
