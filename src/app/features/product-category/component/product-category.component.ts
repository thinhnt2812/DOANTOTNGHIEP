import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { ProductCategoryService } from '../product-category.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-product-category',
  imports: [CommonModule, FormsModule],
  templateUrl: './product-category.component.html',
  styleUrls: ['./product-category.component.css'],
})
export class ProductCategoryComponent implements OnInit {
  @ViewChild('categoryModal') categoryModal: TemplateRef<any> | undefined;
  @ViewChild('deleteModal') deleteModal: TemplateRef<any> | undefined;
  categories: any[] = [];
  currentCategory: any = {};
  categoryToDelete: number | null = null;
  errorMessage: string | null = null;
  searchTerm: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  paginatedCategories: any[] = [];
  sortKey: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(private categoryService: ProductCategoryService, private modalService: NgbModal) {}

  ngOnInit(): void {
    // Thiết lập tiêu đề trang và tải danh sách danh mục sản phẩm
    document.title = 'Danh sách danh mục sản phẩm';
    this.loadCategories();
  }

  loadCategories() {
    // Lấy danh sách danh mục sản phẩm từ dịch vụ và cập nhật danh sách phân trang
    this.categoryService.getCategories().subscribe((data) => {
      this.categories = data;
      this.updatePaginatedCategories();
    });
  }

  updatePaginatedCategories() {
    // Cập nhật danh sách danh mục sản phẩm theo trang hiện tại
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedCategories = this.categories.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    // Tính tổng số trang dựa trên số lượng danh mục và số mục trên mỗi trang
    return Math.ceil(this.categories.length / this.itemsPerPage);
  }

  get pages(): number[] {
    // Tạo danh sách các trang để hiển thị trong phân trang
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
    // Chuyển đến trang đầu tiên
    this.changePage(1);
  }

  goToLastPage() {
    // Chuyển đến trang cuối cùng
    this.changePage(this.totalPages);
  }

  changePage(page: number) {
    // Thay đổi trang hiện tại và cập nhật danh sách phân trang
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePaginatedCategories();
  }

  openModal(category: any = null) {
    // Mở modal để thêm hoặc chỉnh sửa danh mục sản phẩm
    this.currentCategory = category ? { ...category } : {
      id: '',
      name: '',
      description: '',
      status: 'Đang hoạt động'
    };
    this.modalService.open(this.categoryModal);
  }

  saveCategory() {
    // Lưu danh mục sản phẩm (thêm mới hoặc cập nhật)
    if (!this.isFormValid()) {
      this.errorMessage = 'Vui lòng nhập đầy đủ thông tin.';
      return;
    }
    this.errorMessage = null;
    if (this.currentCategory.id) {
      // Cập nhật danh mục sản phẩm
      this.categoryService.updateCategory(this.currentCategory).subscribe(() => {
        const index = this.categories.findIndex(c => c.id === this.currentCategory.id);
        this.categories[index] = this.currentCategory;
        this.updatePaginatedCategories();
        this.modalService.dismissAll();
      });
    } else {
      // Thêm mới danh mục sản phẩm
      const maxId = this.categories.length > 0 ? Math.max(...this.categories.map(c => parseInt(c.id))) : 0;
      this.currentCategory.id = (maxId + 1).toString();
      this.categoryService.addCategory(this.currentCategory).subscribe((category) => {
        this.categories.push(category);
        this.updatePaginatedCategories();
        this.modalService.dismissAll();
      });
    }
  }

  openDeleteModal(id: number) {
    // Mở modal xác nhận xóa danh mục sản phẩm
    this.categoryToDelete = id;
    this.modalService.open(this.deleteModal);
  }

  confirmDelete() {
    // Xác nhận xóa danh mục sản phẩm
    if (this.categoryToDelete !== null) {
      this.deleteCategory(this.categoryToDelete);
      this.categoryToDelete = null;
    }
  }

  deleteCategory(id: number) {
    // Xóa danh mục sản phẩm theo ID
    this.categoryService.deleteCategory(id).subscribe(() => {
      this.categories = this.categories.filter(c => c.id !== id);
      this.updatePaginatedCategories();
    });
  }

  isFormValid(): boolean {
    // Kiểm tra tính hợp lệ của biểu mẫu
    return this.currentCategory.name && this.currentCategory.description && this.currentCategory.status;
  }

  searchCategories() {
    // Tìm kiếm danh mục sản phẩm theo từ khóa
    if (this.searchTerm.trim() === '') {
      this.loadCategories();
    } else {
      this.categories = this.categories.filter(category =>
        category.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        category.description.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
      this.updatePaginatedCategories();
    }
  }

  onSearchTermChange() {
    // Xử lý khi từ khóa tìm kiếm thay đổi
    if (this.searchTerm.trim() === '') {
      this.loadCategories();
    }
  }

  sortCategories(key: string) {
    // Sắp xếp danh mục sản phẩm theo cột được chọn
    if (this.sortKey === key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortDirection = 'asc';
    }
    this.categories.sort((a, b) => {
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
    this.updatePaginatedCategories();
  }
}
