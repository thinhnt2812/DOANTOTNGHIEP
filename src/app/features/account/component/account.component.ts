import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { AccountService } from '../account.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EmployeeService } from '../../employee/employee.service';

@Component({
  selector: 'app-account',
  imports: [CommonModule, FormsModule],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css'],
})
export class AccountComponent implements OnInit {
  @ViewChild('accountModal') accountModal: TemplateRef<any> | undefined; // Modal để thêm/sửa tài khoản
  @ViewChild('deleteModal') deleteModal: TemplateRef<any> | undefined; // Modal để xác nhận xóa tài khoản
  accounts: any[] = []; // Danh sách tài khoản
  currentAccount: any = {}; // Tài khoản hiện tại đang được thêm/sửa
  accountToDelete: number | null = null; // ID tài khoản cần xóa
  errorMessage: string | null = null; // Thông báo lỗi
  searchTerm: string = ''; // Từ khóa tìm kiếm
  currentPage: number = 1; // Trang hiện tại
  itemsPerPage: number = 10; // Số lượng tài khoản trên mỗi trang
  paginatedAccounts: any[] = []; // Danh sách tài khoản được phân trang
  sortKey: string = ''; // Khóa sắp xếp
  sortDirection: 'asc' | 'desc' = 'asc'; // Hướng sắp xếp
  activeEmployees: any[] = []; // Danh sách nhân viên đang hoạt động

  constructor(private accountService: AccountService, private modalService: NgbModal, private employeeService: EmployeeService) {}

  ngOnInit(): void {
    document.title = 'Danh sách tài khoản'; // Đặt tiêu đề trang
    this.loadAccounts(); // Tải danh sách tài khoản
    this.loadActiveEmployees(); // Tải danh sách nhân viên đang hoạt động
  }

  loadAccounts() {
    // Hàm tải danh sách tài khoản từ service
    this.accountService.getAccounts().subscribe((data) => {
      this.accounts = data;
      this.updatePaginatedAccounts(); // Cập nhật danh sách tài khoản phân trang
    });
  }

  loadActiveEmployees() {
    // Hàm tải danh sách nhân viên đang hoạt động từ service
    this.employeeService.getActiveEmployees().subscribe((data) => {
      this.activeEmployees = data;
    });
  }

  updatePaginatedAccounts() {
    // Hàm cập nhật danh sách tài khoản theo trang hiện tại
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedAccounts = this.accounts.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    // Hàm tính tổng số trang
    return Math.ceil(this.accounts.length / this.itemsPerPage);
  }

  get pages(): number[] {
    // Hàm tính danh sách các trang để hiển thị
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
    // Hàm chuyển đến trang đầu tiên
    this.changePage(1);
  }

  goToLastPage() {
    // Hàm chuyển đến trang cuối cùng
    this.changePage(this.totalPages);
  }

  changePage(page: number) {
    // Hàm thay đổi trang hiện tại
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePaginatedAccounts();
  }

  openModal(account: any = null) {
    // Hàm mở modal thêm/sửa tài khoản
    this.currentAccount = account ? { ...account } : {
      id: '',
      loginname: '',
      password: '',
      phone: '',
      accountowner: '',
      role: 'Admin',
      status: 'Đang hoạt động'
    };
    this.modalService.open(this.accountModal);
  }

  saveAccount() {
    // Hàm lưu tài khoản (thêm mới hoặc cập nhật)
    if (!this.isFormValid()) {
      return;
    }
    this.errorMessage = null;
    if (this.currentAccount.id) {
      // Cập nhật tài khoản
      this.accountService.updateAccount(this.currentAccount).subscribe(() => {
        const index = this.accounts.findIndex(a => a.id === this.currentAccount.id);
        this.accounts[index] = this.currentAccount;
        this.updatePaginatedAccounts();
        this.modalService.dismissAll();
      });
    } else {
      // Thêm mới tài khoản
      const maxId = this.accounts.length > 0 ? Math.max(...this.accounts.map(a => parseInt(a.id))) : 0;
      this.currentAccount.id = (maxId + 1).toString();
      this.accountService.addAccount(this.currentAccount).subscribe((account) => {
        this.accounts.push(account);
        this.updatePaginatedAccounts();
        this.modalService.dismissAll();
      });
    }
  }

  openDeleteModal(id: number) {
    // Hàm mở modal xác nhận xóa tài khoản
    this.accountToDelete = id;
    this.modalService.open(this.deleteModal);
  }

  confirmDelete() {
    // Hàm xác nhận xóa tài khoản
    if (this.accountToDelete !== null) {
      this.deleteAccount(this.accountToDelete);
      this.accountToDelete = null;
    }
  }

  deleteAccount(id: number) {
    // Hàm xóa tài khoản
    this.accountService.deleteAccount(id).subscribe(() => {
      this.accounts = this.accounts.filter(a => a.id !== id);
      this.updatePaginatedAccounts();
    });
  }

  isFormValid(): boolean {
    // Hàm kiểm tra tính hợp lệ của form
    const phonePattern = /^[0-9]+$/;
    if (!this.currentAccount.loginname || !this.currentAccount.password || !this.currentAccount.phone || !this.currentAccount.accountowner || !this.currentAccount.role || !this.currentAccount.status) {
      this.errorMessage = 'Vui lòng nhập đầy đủ thông tin.';
      return false;
    }
    if (!phonePattern.test(this.currentAccount.phone)) {
      this.errorMessage = 'Số điện thoại chỉ được chứa số.';
      return false;
    }
    if (this.currentAccount.password.length < 6) {
      this.errorMessage = 'Mật khẩu phải có ít nhất 6 ký tự.';
      return false;
    }
    return true;
  }

  searchAccounts() {
    // Hàm tìm kiếm tài khoản theo từ khóa
    if (this.searchTerm.trim() === '') {
      this.loadAccounts();
    } else {
      this.accounts = this.accounts.filter(account =>
        account.loginname.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        account.accountowner.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
      this.updatePaginatedAccounts();
    }
  }

  onSearchTermChange() {
    // Hàm xử lý khi từ khóa tìm kiếm thay đổi
    if (this.searchTerm.trim() === '') {
      this.loadAccounts();
    }
  }

  sortAccounts(key: string) {
    // Hàm sắp xếp danh sách tài khoản theo khóa
    if (this.sortKey === key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortDirection = 'asc';
    }
    this.accounts.sort((a, b) => {
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
    this.updatePaginatedAccounts();
  }
}
