import { Component } from '@angular/core';
import { HeaderComponent } from './share/header/header.component';
import { CategoryComponent } from './share/category/category.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [HeaderComponent, CategoryComponent, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'DOANTOTNGHIEP';
}
