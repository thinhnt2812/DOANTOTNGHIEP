import { Component } from '@angular/core';
import { HeaderComponent } from '../../share/header/header.component';
import { CategoryComponent } from '../../share/category/category.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [HeaderComponent, CategoryComponent, RouterModule],
  templateUrl: './admin-dashboard.component.html'
})
export class AdminDashboardComponent {
  
}
