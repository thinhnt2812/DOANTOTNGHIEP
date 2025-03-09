import { Component, OnInit } from '@angular/core';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-category',
  imports: [RouterLink],
  templateUrl: './category.component.html',
  styleUrl: './category.component.css'
})
export class CategoryComponent implements OnInit {
  selectedCategory: string = '';

  ngOnInit() {
    const storedCategory = localStorage.getItem('selectedCategory');
    if (storedCategory) {
      this.selectedCategory = storedCategory;
    }
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
    localStorage.setItem('selectedCategory', category);
  }
}
