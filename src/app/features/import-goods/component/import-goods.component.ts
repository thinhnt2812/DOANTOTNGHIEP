import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { ImportGoodsService } from '../import-goods.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProductCategoryService } from '../../product-category/product-category.service';
import { SupplierService } from '../../supplier/supplier.service';
import { ProductService } from '../../product/product.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-import-goods',
  imports: [CommonModule, FormsModule],
  templateUrl: './import-goods.component.html',
  styleUrls: ['./import-goods.component.css'],
})
export class ImportGoodsComponent implements OnInit {
  @ViewChild('importGoodModal') importGoodModal: TemplateRef<any> | undefined;
  @ViewChild('deleteModal') deleteModal: TemplateRef<any> | undefined;
  @ViewChild('bulkDeleteModal') bulkDeleteModal: TemplateRef<any> | undefined;
  importGoods: any[] = [];
  currentImportGood: any = {};
  importGoodToDelete: number | null = null;
  errorMessage: string | null = null;
  searchTerm: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  paginatedImportGoods: any[] = [];
  sortKey: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  activeCategories: any[] = [];
  activeSuppliers: any[] = [];
  productOptions: any[] = [];
  selectAll: boolean = false;

  constructor(private importGoodsService: ImportGoodsService, private modalService: NgbModal, private productCategoryService: ProductCategoryService, private supplierService: SupplierService, private productService: ProductService) {}

  ngOnInit(): void {
    // Khởi tạo dữ liệu khi component được tải
    document.title = 'Danh sách nhập hàng';
    this.loadImportGoods();
    this.loadCategories();
    this.loadSuppliers();
    this.loadProducts();
  }

  // Tải danh sách nhập hàng từ dịch vụ
  loadImportGoods() {
    this.importGoodsService.getImportGoods().subscribe((data) => {
      this.importGoods = data;
      this.updatePaginatedImportGoods();
    });
  }

  // Tải danh sách danh mục sản phẩm đang hoạt động
  loadCategories() {
    this.productCategoryService.getCategories().subscribe((data) => {
      this.activeCategories = data.filter(category => category.status === 'Đang hoạt động');
    });
  }

  // Tải danh sách nhà cung cấp đang hợp tác
  loadSuppliers() {
    this.supplierService.getSuppliers().subscribe((data) => {
      this.activeSuppliers = data.filter(supplier => supplier.status === 'Đang hợp tác');
    });
  }

  // Tải danh sách sản phẩm
  loadProducts() {
    this.productService.getProducts().subscribe((data) => {
      this.productOptions = data;
    });
  }

  // Cập nhật danh sách nhập hàng theo phân trang
  updatePaginatedImportGoods() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedImportGoods = this.importGoods.slice(startIndex, endIndex);
  }

  // Lấy tổng số trang
  get totalPages(): number {
    return Math.ceil(this.importGoods.length / this.itemsPerPage);
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
    this.updatePaginatedImportGoods();
  }

  // Mở modal để thêm hoặc chỉnh sửa nhập hàng
  openModal(importGood: any = null) {
    this.currentImportGood = importGood ? { ...importGood } : {
      id: '',
      nameproduct: '',
      type: '',
      supplier: '',
      quantity: 0,
      price: 0,
      date: '',
      isNewProduct: false
    };
    this.modalService.open(this.importGoodModal);
  }

  // Xử lý khi thay đổi tùy chọn sản phẩm
  onProductOptionChange() {
    if (!this.currentImportGood.isNewProduct) {
      this.onExistingProductChange();
    } else {
      this.currentImportGood.type = '';
      this.currentImportGood.supplier = '';
    }
  }

  // Cập nhật thông tin sản phẩm khi chọn sản phẩm đã tồn tại
  onExistingProductChange() {
    const selectedProduct = this.productOptions.find(product => product.name === this.currentImportGood.nameproduct);
    if (selectedProduct) {
      this.currentImportGood.type = selectedProduct.type;
      this.currentImportGood.supplier = selectedProduct.supplier;
    }
  }

  // Lưu thông tin nhập hàng
  saveImportGood() {
    if (!this.isFormValid()) {
      this.errorMessage = 'Vui lòng nhập đầy đủ thông tin.';
      return;
    }
    if (new Date(this.currentImportGood.date) > new Date()) {
      this.errorMessage = 'Ngày nhập không được vượt quá ngày hôm nay.';
      return;
    }
    if (isNaN(this.currentImportGood.quantity) || this.currentImportGood.quantity < 0) {
      this.errorMessage = 'Số lượng phải là số dương.';
      return;
    }
    if (isNaN(this.currentImportGood.price)) {
      this.errorMessage = 'Giá nhập phải là số.';
      return;
    }
    this.errorMessage = null;
    if (this.currentImportGood.id) {
      const originalImportGood = this.importGoods.find(p => p.id === this.currentImportGood.id);
      const quantityDifference = this.currentImportGood.quantity - originalImportGood.quantity;

      this.importGoodsService.updateImportGood(this.currentImportGood).subscribe(() => {
        const index = this.importGoods.findIndex(p => p.id === this.currentImportGood.id);
        this.importGoods[index] = this.currentImportGood;
        this.updatePaginatedImportGoods();
        this.modalService.dismissAll();

        const existingProduct = this.productOptions.find(product => product.name === this.currentImportGood.nameproduct);
        if (existingProduct) {
          existingProduct.quantity += quantityDifference;
          this.productService.updateProduct(existingProduct).subscribe();
        } else {
          const newProduct = {
            id: (Math.max(...this.productOptions.map(p => parseInt(p.id))) + 1).toString(),
            name: this.currentImportGood.nameproduct,
            type: this.currentImportGood.type,
            supplier: this.currentImportGood.supplier,
            quantity: this.currentImportGood.quantity,
            importprice: this.currentImportGood.price,
            status: 'Hàng nhập'
          };
          this.productService.addProduct(newProduct).subscribe();
        }
      });
    } else {
      const maxId = this.importGoods.length > 0 ? Math.max(...this.importGoods.map(p => parseInt(p.id))) : 0;
      this.currentImportGood.id = (maxId + 1).toString();
      this.importGoodsService.addImportGood(this.currentImportGood).subscribe((importGood) => {
        this.importGoods.push(importGood);
        this.updatePaginatedImportGoods();
        this.modalService.dismissAll();

        if (!this.currentImportGood.isNewProduct) {
          const existingProduct = this.productOptions.find(product => product.name === this.currentImportGood.nameproduct);
          if (existingProduct) {
            existingProduct.quantity += this.currentImportGood.quantity;
            this.productService.updateProduct(existingProduct).subscribe();
          }
        } else {
          this.productService.getProducts().subscribe((products) => {
            const maxProductId = products.length > 0 ? Math.max(...products.map(p => parseInt(p.id))) : 0;
            const newProduct = {
              id: (maxProductId + 1).toString(),
              name: this.currentImportGood.nameproduct,
              type: this.currentImportGood.type,
              supplier: this.currentImportGood.supplier,
              quantity: this.currentImportGood.quantity,
              importprice: this.currentImportGood.price,
              status: 'Hàng nhập'
            };
            this.productService.addProduct(newProduct).subscribe();
          });
        }
      });
    }
  }

  // Mở modal xác nhận xóa nhập hàng
  openDeleteModal(id: number) {
    this.importGoodToDelete = id;
    this.modalService.open(this.deleteModal);
  }

  // Xác nhận xóa nhập hàng
  confirmDelete() {
    if (this.importGoodToDelete !== null) {
      this.deleteImportGood(this.importGoodToDelete);
      this.importGoodToDelete = null;
    }
  }

  // Xóa nhập hàng
  deleteImportGood(id: number) {
    this.importGoodsService.deleteImportGood(id).subscribe(() => {
      this.importGoods = this.importGoods.filter(p => p.id !== id);
      this.updatePaginatedImportGoods();
    });
  }

  // Mở modal xác nhận xóa nhiều nhập hàng
  openBulkDeleteModal() {
    this.modalService.open(this.bulkDeleteModal);
  }

  // Xác nhận xóa nhiều nhập hàng
  confirmBulkDelete() {
    const selectedIds = this.paginatedImportGoods.filter(importGood => importGood.selected).map(importGood => importGood.id);
    selectedIds.forEach(id => this.deleteImportGood(id));
  }

  // Kiểm tra tính hợp lệ của form
  isFormValid(): boolean {
    return this.currentImportGood.nameproduct && this.currentImportGood.type && this.currentImportGood.supplier && this.currentImportGood.quantity && this.currentImportGood.price && this.currentImportGood.date;
  }

  // Tìm kiếm nhập hàng theo từ khóa
  searchImportGoods() {
    if (this.searchTerm.trim() === '') {
      this.loadImportGoods();
    } else {
      this.importGoods = this.importGoods.filter(importGood =>
        importGood.nameproduct.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        importGood.type.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        importGood.supplier.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
      this.updatePaginatedImportGoods();
    }
  }

  // Xử lý khi thay đổi từ khóa tìm kiếm
  onSearchTermChange() {
    if (this.searchTerm.trim() === '') {
      this.loadImportGoods();
    }
  }

  // Sắp xếp danh sách nhập hàng theo cột
  sortImportGoods(key: string) {
    if (this.sortKey === key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortDirection = 'asc';
    }
    this.importGoods.sort((a, b) => {
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
    this.updatePaginatedImportGoods();
  }

  // Chọn hoặc bỏ chọn tất cả nhập hàng
  toggleSelectAll(event: any) {
    const isChecked = event.target.checked;
    this.paginatedImportGoods.forEach(importGood => importGood.selected = isChecked);
    this.selectAll = isChecked;
  }

  // Xử lý khi thay đổi trạng thái checkbox
  onCheckboxChange() {
    this.selectAll = this.paginatedImportGoods.every(importGood => importGood.selected);
  }

  // Xóa các nhập hàng đã chọn
  deleteSelected() {
    const selectedIds = this.paginatedImportGoods.filter(importGood => importGood.selected).map(importGood => importGood.id);
    selectedIds.forEach(id => this.deleteImportGood(id));
  }

  // Xuất danh sách nhập hàng đã chọn ra file Excel
  exportToExcel() {
    const selectedData = this.paginatedImportGoods.filter(importGood => importGood.selected);
    const worksheet = XLSX.utils.json_to_sheet(selectedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'ImportGoods');
    XLSX.writeFile(workbook, 'ImportGoods.xlsx');
  }
}
