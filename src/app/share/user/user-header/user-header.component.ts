import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../login/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-header',
  imports: [],
  templateUrl: './user-header.component.html',
  styleUrl: './user-header.component.css'
})
export class UserHeaderComponent implements OnInit {
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
