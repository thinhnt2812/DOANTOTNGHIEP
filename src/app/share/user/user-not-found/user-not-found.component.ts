import { Component } from '@angular/core';
import { AuthService } from '../../../login/auth.service';
import { Router, RouterLink } from '@angular/router';


@Component({
  selector: 'app-user-not-found',
  imports: [RouterLink],
  templateUrl: './user-not-found.component.html',
  styleUrl: './user-not-found.component.css'
})
export class UserNotFoundComponent {
  userName: string | undefined;

  constructor(private authService: AuthService, private router: Router) {}
  
  ngOnInit() {
    this.userName = this.authService.getUserName();
  }
}
