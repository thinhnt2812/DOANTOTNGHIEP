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

  // Hàm khởi tạo, được gọi khi component được tải
  ngOnInit(): void {
    document.title = 'Danh sách đơn hàng';
    this.fetchOrders();
    this.fetchProducts();
    this.pendingSearchTerm = this.searchTerm;
    this.pendingSelectedProduct = this.selectedProduct;
  }

  // Lấy danh sách đơn hàng từ service
  fetchOrders(): void {
    this.orderService.getOrder().subscribe((data) => {
      this.orders = data;
      this.filteredOrders = data;
      this.uniqueProducts = [...new Set(data.map(order => order.purchasedproduct))];
    });
  }

  // Lấy danh sách sản phẩm từ service
  fetchProducts(): void {
    this.productService.getProducts().subscribe((products) => {
        this.uniqueProducts = products.map(product => product.name);
    });
  }

  // Xử lý khi người dùng nhập từ khóa tìm kiếm
  onSearchTermInput(): void {
    this.pendingSearchTerm = this.pendingSearchTerm.trim();
    if (this.pendingSearchTerm === '') {
      this.filteredOrders = [...this.orders]; 
    }
  }

  // Xử lý khi người dùng nhập bộ lọc sản phẩm
  onProductFilterInput(): void {
    this.pendingSelectedProduct = this.pendingSelectedProduct.trim();
  }

  // Xác nhận áp dụng bộ lọc
  confirmFilters(): void {
    this.searchTerm = this.pendingSearchTerm;
    this.selectedProduct = this.pendingSelectedProduct;
    this.applyFilters();
  }

  // Xử lý khi từ khóa tìm kiếm thay đổi
  onSearchTermChange(): void {
    this.applyFilters();
  }

  // Xử lý khi bộ lọc sản phẩm thay đổi
  onProductFilterChange(): void {
    this.applyFilters();
  }

  // Áp dụng bộ lọc và sắp xếp danh sách đơn hàng
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

  // Xử lý khi người dùng thay đổi tiêu chí sắp xếp
  onSort(key: string): void {
    if (this.sortKey === key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortDirection = 'asc';
    }
    this.applyFilters();
  }

  // Tính tổng số trang
  get totalPages(): number {
    return Math.ceil(this.filteredOrders.length / this.itemsPerPage);
  }

  // Lấy danh sách đơn hàng theo trang
  get paginatedOrders(): OrderManagementModel[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredOrders.slice(startIndex, endIndex);
  }

  // Chuyển đến trang cụ thể
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // Chuyển đến trang đầu tiên
  goToFirstPage(): void {
    this.changePage(1);
  }

  // Chuyển đến trang cuối cùng
  goToLastPage(): void {
    this.changePage(this.totalPages);
  }
}
