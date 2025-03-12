import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { ProductService } from '../product.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProductCategoryService } from '../../product-category/product-category.service';
import { SupplierService } from '../../supplier/supplier.service';

@Component({
  selector: 'app-product',
  imports: [CommonModule, FormsModule],
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css'],
})
export class ProductComponent implements OnInit {
  @ViewChild('productModal') productModal: TemplateRef<any> | undefined;
  @ViewChild('deleteModal') deleteModal: TemplateRef<any> | undefined;
  products: any[] = [];
  currentProduct: any = {};
  productToDelete: number | null = null;
  errorMessage: string | null = null;
  searchTerm: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  paginatedProducts: any[] = [];
  sortKey: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  activeCategories: any[] = [];
  activeSuppliers: any[] = [];
  filterType: string = '';
  filterSupplier: string = '';
  filterStatus: string = '';

  constructor(private productService: ProductService, private modalService: NgbModal, private productCategoryService: ProductCategoryService, private supplierService: SupplierService) {}

  ngOnInit(): void {
    document.title = 'Danh sách sản phẩm';
    this.loadProducts();
    this.loadCategories();
    this.loadSuppliers();
  }

  loadProducts() {
    this.productService.getProducts().subscribe((data) => {
      this.products = data;
      this.updatePaginatedProducts();
    });
  }

  loadCategories() {
    this.productCategoryService.getCategories().subscribe((data) => {
      this.activeCategories = data.filter(category => category.status === 'Đang hoạt động');
    });
  }

  loadSuppliers() {
    this.supplierService.getSuppliers().subscribe((data) => {
      this.activeSuppliers = data.filter(supplier => supplier.status === 'Đang hợp tác');
    });
  }

  updatePaginatedProducts() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedProducts = this.products.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    return Math.ceil(this.products.length / this.itemsPerPage);
  }

  get pages(): number[] {
    const totalPages = this.totalPages;
    const currentPage = this.currentPage;
    const pages = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) {
        pages.push(-1); 
      }
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) {
        pages.push(-1); 
      }
      pages.push(totalPages);
    }
    return pages;
  }

  goToFirstPage() {
    this.changePage(1);
  }

  goToLastPage() {
    this.changePage(this.totalPages);
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePaginatedProducts();
  }

  openModal(product: any = null) {
    this.currentProduct = product ? { ...product } : {
      id: '',
      name: '',
      type: '',
      size: '',
      supplier: '',
      quantity: 0,
      price: 0,
      importprice: 0,
      status: 'Đang bán'
    };
    this.modalService.open(this.productModal);
  }

  saveProduct() {
    if (!this.isFormValid()) {
      this.errorMessage = 'Vui lòng nhập đầy đủ thông tin.';
      return;
    }
    if (isNaN(this.currentProduct.quantity) || isNaN(this.currentProduct.price) || isNaN(this.currentProduct.importprice)) {
      this.errorMessage = 'Số lượng, giá bán và giá nhập phải là số.';
      return;
    }
    if (this.currentProduct.quantity < 0 || this.currentProduct.price < 0 || this.currentProduct.importprice < 0) {
      this.errorMessage = 'Số lượng, giá bán và giá nhập không được là số âm.';
      return;
    }
    this.errorMessage = null;
    if (this.currentProduct.id) {
      this.productService.updateProduct(this.currentProduct).subscribe(() => {
        const index = this.products.findIndex(p => p.id === this.currentProduct.id);
        this.products[index] = this.currentProduct;
        this.updatePaginatedProducts();
        this.modalService.dismissAll();
      });
    } else {
      const maxId = this.products.length > 0 ? Math.max(...this.products.map(p => parseInt(p.id))) : 0;
      this.currentProduct.id = (maxId + 1).toString();
      this.productService.addProduct(this.currentProduct).subscribe((product) => {
        this.products.push(product);
        this.updatePaginatedProducts();
        this.modalService.dismissAll();
      });
    }
  }

  openDeleteModal(id: number) {
    this.productToDelete = id;
    this.modalService.open(this.deleteModal);
  }

  confirmDelete() {
    if (this.productToDelete !== null) {
      this.deleteProduct(this.productToDelete);
      this.productToDelete = null;
    }
  }

  deleteProduct(id: number) {
    this.productService.deleteProduct(id).subscribe(() => {
      this.products = this.products.filter(p => p.id !== id);
      this.updatePaginatedProducts();
    });
  }

  isFormValid(): boolean {
    return this.currentProduct.name && this.currentProduct.type && this.currentProduct.size && this.currentProduct.supplier && this.currentProduct.quantity && this.currentProduct.price && this.currentProduct.importprice && this.currentProduct.status;
  }

  sortProducts(key: string) {
    if (this.sortKey === key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortDirection = 'asc';
    }
    this.products.sort((a, b) => {
      const valueA = key === 'id' ? parseInt(a[key]) : a[key];
      const valueB = key === 'id' ? parseInt(b[key]) : b[key];
      if (valueA < valueB) {
        return this.sortDirection === 'asc' ? -1 : 1;
      } else if (valueA > valueB) {
        return this.sortDirection === 'asc' ? 1 : -1;
      } else {
        return 0;
      }
    });
    this.updatePaginatedProducts();
  }

  applySearchAndFilters() {
    this.productService.getProducts().subscribe((data) => {
      this.products = data.filter(product => {
        const matchesSearchTerm = this.searchTerm.trim() === '' || 
          product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          product.type.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          product.supplier.toLowerCase().includes(this.searchTerm.toLowerCase());

        const matchesFilterType = !this.filterType || product.type === this.filterType;
        const matchesFilterSupplier = !this.filterSupplier || product.supplier === this.filterSupplier;
        const matchesFilterStatus = !this.filterStatus || product.status === this.filterStatus;

        return matchesSearchTerm && matchesFilterType && matchesFilterSupplier && matchesFilterStatus;
      });
      this.updatePaginatedProducts();
    });
  }
}
