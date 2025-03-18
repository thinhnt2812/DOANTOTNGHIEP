import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderManagementService } from '../order-management.service';
import { OrderManagementModel } from '../order-management.model';
import { ProductService } from '../../product/product.service';

@Component({
  selector: 'app-order-management',
  imports: [CommonModule, FormsModule],
  templateUrl: './order-management.component.html',
  styleUrls: ['./order-management.component.css'],
})
export class OrderManagementComponent implements OnInit {
  orders: OrderManagementModel[] = [];
  filteredOrders: OrderManagementModel[] = [];
  uniqueProducts: string[] = [];
  searchTerm: string = '';
  selectedProduct: string = '';
  sortKey: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  pendingSearchTerm: string = '';
  pendingSelectedProduct: string = '';

  constructor(
    private orderService: OrderManagementService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    document.title = 'Danh sách đơn hàng';
    this.fetchOrders();
    this.fetchProducts();
    this.pendingSearchTerm = this.searchTerm;
    this.pendingSelectedProduct = this.selectedProduct;
  }

  fetchOrders(): void {
    this.orderService.getOrder().subscribe((data) => {
      this.orders = data;
      this.filteredOrders = data;
      this.uniqueProducts = [...new Set(data.map(order => order.purchasedproduct))];
    });
  }

  fetchProducts(): void {
    this.productService.getProducts().subscribe((products) => {
        this.uniqueProducts = products.map(product => product.name);
    });
  }

  onSearchTermInput(): void {
    this.pendingSearchTerm = this.pendingSearchTerm.trim();
  }

  onProductFilterInput(): void {
    this.pendingSelectedProduct = this.pendingSelectedProduct.trim();
  }

  confirmFilters(): void {
    this.searchTerm = this.pendingSearchTerm;
    this.selectedProduct = this.pendingSelectedProduct;
    this.applyFilters();
  }

  onSearchTermChange(): void {
    this.applyFilters();
  }

  onProductFilterChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredOrders = this.orders.filter(order => {
      const matchesSearch = order.customername.toLowerCase().includes(term) ||
                            order.customerphone.includes(term) ||
                            order.purchasedproduct.toLowerCase().includes(term);
      const matchesProduct = this.selectedProduct ? order.purchasedproduct === this.selectedProduct : true;
      return matchesSearch && matchesProduct;
    });

    if (this.sortKey) {
      this.filteredOrders.sort((a, b) => {
        const valueA = a[this.sortKey as keyof OrderManagementModel];
        const valueB = b[this.sortKey as keyof OrderManagementModel];
        if (valueA < valueB) {
          return this.sortDirection === 'asc' ? -1 : 1;
        } else if (valueA > valueB) {
          return this.sortDirection === 'asc' ? 1 : -1;
        } else {
          return 0;
        }
      });
    }
  }

  onSort(key: string): void {
    if (this.sortKey === key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortDirection = 'asc';
    }
    this.applyFilters();
  }

  get totalPages(): number {
    return Math.ceil(this.filteredOrders.length / this.itemsPerPage);
  }

  get paginatedOrders(): OrderManagementModel[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredOrders.slice(startIndex, endIndex);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  goToFirstPage(): void {
    this.changePage(1);
  }

  goToLastPage(): void {
    this.changePage(this.totalPages);
  }
}
