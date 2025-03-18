import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UserHeaderComponent } from '../../share/user/user-header/user-header.component';

@Component({
  selector: 'app-dashboard',
  imports: [UserHeaderComponent, RouterModule],
  templateUrl: './user-dashboard.component.html'
})
export class UserDashboardComponent {
  
}
