import { Component } from '@angular/core';
import { AuthService } from '../../login/auth.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-page-not-found',
  imports: [],
  templateUrl: './page-not-found.component.html',
  styleUrl: './page-not-found.component.css'
})
export class PageNotFoundComponent {
  userName: string | undefined;

  constructor(private authService: AuthService, private router: Router) {}
  
  ngOnInit() {
    this.userName = this.authService.getUserName();
  }
}
