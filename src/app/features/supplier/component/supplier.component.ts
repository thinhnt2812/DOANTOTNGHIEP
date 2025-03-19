import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { SupplierService } from '../supplier.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-supplier',
  imports: [CommonModule, FormsModule],
  templateUrl: './supplier.component.html',
  styleUrls: ['./supplier.component.css'],
})
export class SupplierComponent implements OnInit {
  @ViewChild('supplierModal') supplierModal: TemplateRef<any> | undefined;
  @ViewChild('deleteModal') deleteModal: TemplateRef<any> | undefined;
  suppliers: any[] = [];
  currentSupplier: any = {};
  supplierToDelete: number | null = null;
  errorMessage: string | null = null;
  searchTerm: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  paginatedSuppliers: any[] = [];
  sortKey: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(private supplierService: SupplierService, private modalService: NgbModal) {}

  ngOnInit(): void {
    // Đặt tiêu đề trang và tải danh sách nhà cung cấp
    document.title = 'Danh sách nhà cung cấp';
    this.loadSuppliers();
  }

  // Tải danh sách nhà cung cấp từ dịch vụ
  loadSuppliers() {
    this.supplierService.getSuppliers().subscribe((data) => {
      this.suppliers = data;
      this.updatePaginatedSuppliers();
    });
  }

  // Cập nhật danh sách nhà cung cấp theo phân trang
  updatePaginatedSuppliers() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedSuppliers = this.suppliers.slice(startIndex, endIndex);
  }

  // Tính tổng số trang
  get totalPages(): number {
    return Math.ceil(this.suppliers.length / this.itemsPerPage);
  }

  // Lấy danh sách các trang hiển thị
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

  // Chuyển đến trang đầu tiên
  goToFirstPage() {
    this.changePage(1);
  }

  // Chuyển đến trang cuối cùng
  goToLastPage() {
    this.changePage(this.totalPages);
  }

  // Thay đổi trang hiện tại
  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePaginatedSuppliers();
  }

  // Mở modal thêm/sửa nhà cung cấp
  openModal(supplier: any = null) {
    this.currentSupplier = supplier ? { ...supplier } : {
      id: '',
      name: '',
      address: '',
      status: 'Đang hợp tác'
    };
    this.modalService.open(this.supplierModal);
  }

  // Lưu thông tin nhà cung cấp (thêm mới hoặc cập nhật)
  saveSupplier() {
    if (!this.isFormValid()) {
      return;
    }
    this.errorMessage = null;
    if (this.currentSupplier.id) {
      // Cập nhật nhà cung cấp
      this.supplierService.updateSupplier(this.currentSupplier).subscribe(() => {
        const index = this.suppliers.findIndex(s => s.id === this.currentSupplier.id);
        this.suppliers[index] = this.currentSupplier;
        this.updatePaginatedSuppliers();
        this.modalService.dismissAll();
      });
    } else {
      // Thêm mới nhà cung cấp
      const maxId = this.suppliers.length > 0 ? Math.max(...this.suppliers.map(s => parseInt(s.id))) : 0;
      this.currentSupplier.id = (maxId + 1).toString();
      this.supplierService.addSupplier(this.currentSupplier).subscribe((supplier) => {
        this.suppliers.push(supplier);
        this.updatePaginatedSuppliers();
        this.modalService.dismissAll();
      });
    }
  }

  // Mở modal xác nhận xóa nhà cung cấp
  openDeleteModal(id: number) {
    this.supplierToDelete = id;
    this.modalService.open(this.deleteModal);
  }

  // Xác nhận xóa nhà cung cấp
  confirmDelete() {
    if (this.supplierToDelete !== null) {
      this.deleteSupplier(this.supplierToDelete);
      this.supplierToDelete = null;
    }
  }

  // Xóa nhà cung cấp
  deleteSupplier(id: number) {
    this.supplierService.deleteSupplier(id).subscribe(() => {
      this.suppliers = this.suppliers.filter(s => s.id !== id);
      this.updatePaginatedSuppliers();
    });
  }

  // Kiểm tra tính hợp lệ của form
  isFormValid(): boolean {
    if (!this.currentSupplier.name || !this.currentSupplier.address || !this.currentSupplier.status) {
      this.errorMessage = 'Vui lòng nhập đầy đủ thông tin.';
      return false;
    }
    return true;
  }

  // Tìm kiếm nhà cung cấp theo từ khóa
  searchSuppliers() {
    if (this.searchTerm.trim() === '') {
      this.loadSuppliers();
    } else {
      this.suppliers = this.suppliers.filter(supplier =>
        supplier.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        supplier.address.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
      this.updatePaginatedSuppliers();
    }
  }

  // Xử lý khi thay đổi từ khóa tìm kiếm
  onSearchTermChange() {
    if (this.searchTerm.trim() === '') {
      this.loadSuppliers();
    }
  }

  // Sắp xếp danh sách nhà cung cấp theo cột
  sortSuppliers(key: string) {
    if (this.sortKey === key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortDirection = 'asc';
    }
    this.suppliers.sort((a, b) => {
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
    this.updatePaginatedSuppliers();
  }
}
