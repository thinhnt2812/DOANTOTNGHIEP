import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { EmployeeService } from '../employee.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-employee',
  imports: [CommonModule, FormsModule],
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css'],
})
export class EmployeeComponent implements OnInit {
  @ViewChild('employeeModal') employeeModal: TemplateRef<any> | undefined;
  @ViewChild('deleteModal') deleteModal: TemplateRef<any> | undefined;
  employees: any[] = [];
  currentEmployee: any = {};
  employeeToDelete: number | null = null;
  errorMessage: string | null = null;
  searchTerm: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  paginatedEmployees: any[] = [];
  sortKey: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  hometowns: string[] = [
    'Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
    'An Giang', 'Bình Dương', 'Bắc Giang', 'Bắc Ninh', 'Bạc Liêu',
    'Bến Tre', 'Bình Định', 'Bình Phước', 'Bình Thuận', 'Cà Mau',
    'Cao Bằng', 'Đắk Lắk', 'Đắk Nông', 'Điện Biên', 'Đồng Nai',
    'Đồng Tháp', 'Gia Lai', 'Hà Giang', 'Hà Nam', 'Hà Tĩnh',
    'Hải Dương', 'Hòa Bình', 'Hậu Giang', 'Hưng Yên', 'Khánh Hòa',
    'Kiên Giang', 'Kon Tum', 'Lai Châu', 'Lâm Đồng', 'Long An',
    'Lào Cai', 'Nam Định', 'Nghệ An', 'Ninh Bình', 'Ninh Thuận',
    'Phú Thọ', 'Phú Yên', 'Quảng Bình', 'Quảng Nam', 'Quảng Ngãi',
    'Quảng Ninh', 'Sóc Trăng', 'Sơn La', 'Tây Ninh', 'Thái Bình',
    'Thái Nguyên', 'Thanh Hóa', 'Thừa Thiên Huế', 'Tiền Giang', 'Trà Vinh',
    'Tuyên Quang', 'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái', 'Bình Dương'
  ];

  constructor(private employeeService: EmployeeService, private modalService: NgbModal) {}

  ngOnInit(): void {
    // Đặt tiêu đề trang và tải danh sách nhân viên khi khởi tạo component
    document.title = 'Danh sách nhân viên';
    this.loadEmployees();
  }

  // Tải danh sách nhân viên từ dịch vụ
  loadEmployees() {
    this.employeeService.getEmployees().subscribe((data) => {
      this.employees = data;
      this.updatePaginatedEmployees();
    });
  }

  // Cập nhật danh sách nhân viên theo phân trang
  updatePaginatedEmployees() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedEmployees = this.employees.slice(startIndex, endIndex);
  }

  // Tính tổng số trang
  get totalPages(): number {
    return Math.ceil(this.employees.length / this.itemsPerPage);
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
    this.updatePaginatedEmployees();
  }

  // Mở modal thêm hoặc chỉnh sửa nhân viên
  openModal(employee: any = null) {
    this.currentEmployee = employee ? { 
      ...employee,
      dob: employee.dob ? new Date(new Date(employee.dob).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().substring(0, 10) : '',
      dow: employee.dow ? new Date(new Date(employee.dow).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().substring(0, 10) : ''
    } : {
      id: '',
      name: '',
      gender: '',
      phone: '',
      hometown: '',
      dob: '',
      dow: '',
      position: '',
      status: 'Đang hoạt động'
    };
    this.modalService.open(this.employeeModal);
  }

  // Lưu thông tin nhân viên (thêm mới hoặc cập nhật)
  saveEmployee() {
    // Kiểm tra tính hợp lệ của biểu mẫu
    if (!this.isFormValid()) {
      this.errorMessage = 'Vui lòng nhập đầy đủ thông tin.';
      return;
    }
    if (!this.isPhoneNumberValid(this.currentEmployee.phone)) {
      this.errorMessage = 'Số điện thoại chỉ được chứa số.';
      return;
    }
    if (!this.isDateOfBirthValid(this.currentEmployee.dob)) {
      this.errorMessage = 'Ngày sinh không được quá ngày hiện tại.';
      return;
    }
    this.errorMessage = null;
    if (this.currentEmployee.id) {
      this.employeeService.updateEmployee(this.currentEmployee).subscribe(() => {
        const index = this.employees.findIndex(e => e.id === this.currentEmployee.id);
        this.employees[index] = this.currentEmployee;
        this.updatePaginatedEmployees();
        this.modalService.dismissAll();
      });
    } else {
      const maxId = this.employees.length > 0 ? Math.max(...this.employees.map(e => parseInt(e.id))) : 0;
      this.currentEmployee.id = (maxId + 1).toString();
      this.employeeService.addEmployee(this.currentEmployee).subscribe((employee) => {
        this.employees.push(employee);
        this.updatePaginatedEmployees();
        this.modalService.dismissAll();
      });
    }
  }

  // Kiểm tra số điện thoại có hợp lệ không
  isPhoneNumberValid(phone: string): boolean {
    return /^\d+$/.test(phone);
  }

  // Kiểm tra ngày sinh có hợp lệ không
  isDateOfBirthValid(dob: string): boolean {
    const today = new Date();
    const birthDate = new Date(dob);
    return birthDate <= today;
  }

  // Mở modal xác nhận xóa nhân viên
  openDeleteModal(id: number) {
    this.employeeToDelete = id;
    this.modalService.open(this.deleteModal);
  }

  // Xác nhận xóa nhân viên
  confirmDelete() {
    if (this.employeeToDelete !== null) {
      this.deleteEmployee(this.employeeToDelete);
      this.employeeToDelete = null;
    }
  }

  // Xóa nhân viên
  deleteEmployee(id: number) {
    this.employeeService.deleteEmployee(id).subscribe(() => {
      this.employees = this.employees.filter(e => e.id !== id);
      this.updatePaginatedEmployees();
    });
  }

  // Kiểm tra biểu mẫu có hợp lệ không
  isFormValid(): boolean {
    return this.currentEmployee.name && this.currentEmployee.gender && this.currentEmployee.phone &&
           this.currentEmployee.hometown && this.currentEmployee.dob && this.currentEmployee.position &&
           this.currentEmployee.dow && this.currentEmployee.status;
  }

  // Tìm kiếm nhân viên theo từ khóa
  searchEmployees() {
    if (this.searchTerm.trim() === '') {
      this.loadEmployees();
    } else {
      this.employees = this.employees.filter(employee =>
        employee.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        employee.phone.includes(this.searchTerm) ||
        employee.hometown.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
      this.updatePaginatedEmployees();
    }
  }

  // Xử lý khi thay đổi từ khóa tìm kiếm
  onSearchTermChange() {
    if (this.searchTerm.trim() === '') {
      this.loadEmployees();
    }
  }

  // Sắp xếp danh sách nhân viên theo cột
  sortEmployees(key: string) {
    if (this.sortKey === key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortDirection = 'asc';
    }
    this.employees.sort((a, b) => {
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
    this.updatePaginatedEmployees();
  }
}
