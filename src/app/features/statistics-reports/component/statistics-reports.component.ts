import { Component, ViewChild, ElementRef, AfterViewInit, OnInit } from '@angular/core';
import { StatisticsReportsService } from '../statistics-reports.service';
import { EmployeeStatistics, SupplierStatistics, CategoryStatistics, ProductStatistics, AccountStatistics } from '../statistics-reports.model';
import { Chart } from 'chart.js/auto';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-statistics-reports',
  imports: [CommonModule, FormsModule],
  templateUrl: './statistics-reports.component.html',
  styleUrls: ['./statistics-reports.component.css'],
})
export class StatisticsReportsComponent implements OnInit, AfterViewInit {
  @ViewChild('employeePieChart', { static: false }) employeePieChart!: ElementRef;
  @ViewChild('productPieChart', { static: false }) productPieChart!: ElementRef;
  @ViewChild('categoryPieChart', { static: false }) categoryPieChart!: ElementRef;
  @ViewChild('supplierPieChart', { static: false }) supplierPieChart!: ElementRef;
  @ViewChild('accountPieChart', { static: false }) accountPieChart!: ElementRef;
  @ViewChild('accountRolePieChart', { static: false }) accountRolePieChart!: ElementRef;
  @ViewChild('revenueBarChart', { static: false }) revenueBarChart!: ElementRef;

  totalEmployees: number = 0;
  activeEmployees: number = 0;
  resignedEmployees: number = 0;
  newEmployees: number = 0; 

  totalProducts: number = 0;
  activeProducts: number = 0;
  outOfStockProducts: number = 0;
  notYetSoldProducts: number = 0;

  totalSuppliers: number = 0;
  activeSuppliers: number = 0;
  inactiveSuppliers: number = 0;

  totalCategories: number = 0;
  activeCategories: number = 0;
  inactiveCategories: number = 0;

  totalAccounts: number = 0;
  activeAccounts: number = 0;
  inactiveAccounts: number = 0;
  adminAccounts: number = 0;
  userAccounts: number = 0;

  totalImportedProducts: number = 0;
  totalOrdertatistics: number = 0;
  totalOrderAmount: number = 0;

  startDate: string = '';
  endDate: string = '';

  filteredOrders: any[] = [];

  notificationMessage: string = '';

  startImportDate: string = '';
  endImportDate: string = '';
  filteredImports: any[] = [];
  totalImportStatistics: number = 0;
  totalImportAmount: number = 0;

  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;
  paginatedOrders: any[] = [];
  pages: number[] = [];

  currentImportPage: number = 1;
  paginatedImports: any[] = [];
  totalImportPages: number = 0;
  importPages: number[] = [];

  currentOrderSortField: string = '';
  currentOrderSortDirection: 'asc' | 'desc' = 'asc';

  currentImportSortField: string = '';
  currentImportSortDirection: 'asc' | 'desc' = 'asc';

  monthlyRevenue: { month: string; revenue: number }[] = [];
  monthlyProfit: { month: string; profit: number }[] = [];

  selectedReportType: string = 'revenue'; // Default to revenue report

  currentChart: Chart | null = null; // Store the current chart instance

  constructor(private statisticsService: StatisticsReportsService, private modalService: NgbModal) {}

  ngOnInit(): void {
    // Khởi tạo tiêu đề trang và tải dữ liệu thống kê từ service
    document.title = 'Thống kê báo cáo';
    this.statisticsService.getEmployeeStatistics().subscribe((data: EmployeeStatistics) => {
      // Lấy dữ liệu thống kê nhân viên
      this.totalEmployees = data.totalEmployees;
      this.activeEmployees = data.activeEmployees;
      this.resignedEmployees = data.resignedEmployees;
      this.newEmployees = data.newEmployees; 
      this.renderEmployeeChart();
    });

    this.statisticsService.getProductStatistics().subscribe((data: ProductStatistics) => {
      // Lấy dữ liệu thống kê sản phẩm
      this.totalProducts = data.totalProducts;
      this.activeProducts = data.activeProducts;
      this.outOfStockProducts = data.outOfStockProducts;
      this.notYetSoldProducts = data.notYetSoldProducts;
      this.renderProductChart();
    });

    this.statisticsService.getSupplierStatistics().subscribe((data: SupplierStatistics) => {
      // Lấy dữ liệu thống kê nhà cung cấp
      this.totalSuppliers = data.totalSuppliers;
      this.activeSuppliers = data.activeSuppliers;
      this.inactiveSuppliers = data.inactiveSuppliers;
      this.renderSupplierChart();
    });

    this.statisticsService.getCategoryStatistics().subscribe((data: CategoryStatistics) => {
      // Lấy dữ liệu thống kê danh mục
      this.totalCategories = data.totalCategories;
      this.activeCategories = data.activeCategories;
      this.inactiveCategories = data.inactiveCategories;
      this.renderCategoryChart();
    });

    this.statisticsService.getAccountStatistics().subscribe((data: AccountStatistics) => {
      // Lấy dữ liệu thống kê tài khoản
      this.totalAccounts = data.totalAccounts;
      this.activeAccounts = data.activeAccounts;
      this.inactiveAccounts = data.inactiveAccounts;
      this.adminAccounts = data.roles.admin;
      this.userAccounts = data.roles.user;
      this.renderAccountChart();
      this.renderAccountRoleChart();
    });

    this.statisticsService.getImportedProductStatistics().subscribe((total: number) => {
      // Lấy tổng số sản phẩm nhập khẩu
      this.totalImportedProducts = total;
    });

    this.statisticsService.getOrdertatistics().subscribe((totalorder: number) => {
      // Lấy tổng số đơn hàng
      this.totalOrdertatistics = totalorder;
    });

    this.statisticsService.getMonthlyRevenue().subscribe((data) => {
      // Lấy dữ liệu doanh thu hàng tháng
      this.monthlyRevenue = data;
      this.renderRevenueChart();
    });

    this.statisticsService.getMonthlyProfit().subscribe((data) => {
      // Lấy dữ liệu lợi nhuận hàng tháng
      this.monthlyProfit = data;
      if (this.selectedReportType === 'profit') {
        this.renderProfitChart();
      }
    });

    // Tải toàn bộ đơn hàng và nhập khẩu
    this.loadAllOrders();
    this.loadAllImports();
  }

  ngAfterViewInit(): void {
    // Hàm được gọi sau khi view đã được khởi tạo
  }

  ngOnChanges(): void {
    // Cập nhật biểu đồ khi loại báo cáo thay đổi
    if (this.selectedReportType === 'revenue') {
      this.renderRevenueChart();
    } else if (this.selectedReportType === 'profit') {
      this.renderProfitChart();
    }
  }

  onReportTypeChange(): void {
    // Xử lý khi người dùng thay đổi loại báo cáo
    if (this.selectedReportType === 'revenue') {
      this.renderRevenueChart();
    } else if (this.selectedReportType === 'profit') {
      this.renderProfitChart();
    }
  }

  renderEmployeeChart(): void {
    // Vẽ biểu đồ thống kê nhân viên
    if (!this.employeePieChart || !this.employeePieChart.nativeElement) return;

    const ctx = this.employeePieChart.nativeElement.getContext('2d');
    if (!ctx) return;

    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Nhân viên đang làm việc', 'Nhân viên đã nghỉ'],
        datasets: [{
          data: [this.activeEmployees, this.resignedEmployees],
          backgroundColor: ['#2E5077', '#D84040'],
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
        },
      },
    });
  }
  renderProductChart(): void {
    // Vẽ biểu đồ thống kê sản phẩm
    if (!this.productPieChart || !this.productPieChart.nativeElement) return;

    const ctx = this.productPieChart.nativeElement.getContext('2d');
    if (!ctx) return;

    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Sản phẩm đang bán', 'Sản phẩm chưa bán', 'Sản phẩm đã dừng bán'],
        datasets: [{
          data: [this.activeProducts, this.notYetSoldProducts, this.outOfStockProducts],
          backgroundColor: ['#2E5077', '#D84040', '#A6CDC6'],
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
        },
      },
    });
  }

  renderCategoryChart(): void {
    // Vẽ biểu đồ thống kê danh mục
    if (!this.categoryPieChart || !this.categoryPieChart.nativeElement) return;

    const ctx = this.categoryPieChart.nativeElement.getContext('2d');
    if (!ctx) return;

    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Danh mục đang hoạt động', 'Danh mục đã ngừng hoạt động'],
        datasets: [{
          data: [this.activeCategories, this.inactiveCategories],
          backgroundColor: ['#2E5077', '#D84040'],
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
        },
      },
    });
  }

  renderSupplierChart(): void {
    // Vẽ biểu đồ thống kê nhà cung cấp
    if (!this.supplierPieChart || !this.supplierPieChart.nativeElement) return;

    const ctx = this.supplierPieChart.nativeElement.getContext('2d');
    if (!ctx) return;

    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Nhà cung cấp đang hoạt động', 'Nhà cung cấp đã ngừng hợp tác'],
        datasets: [{
          data: [this.activeSuppliers, this.inactiveSuppliers],
          backgroundColor: ['#2E5077', '#D84040'],
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
        },
      },
    });
  }

  renderAccountChart(): void {
    // Vẽ biểu đồ thống kê tài khoản
    if (!this.accountPieChart || !this.accountPieChart.nativeElement) return;

    const ctx = this.accountPieChart.nativeElement.getContext('2d');
    if (!ctx) return;

    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Tài khoản đang hoạt động', 'Tài khoản đã dừng'],
        datasets: [{
          data: [this.activeAccounts, this.inactiveAccounts],
          backgroundColor: ['#2E5077', '#D84040'],
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
        },
      },
    });
  }

  renderAccountRoleChart(): void {
    // Vẽ biểu đồ thống kê vai trò tài khoản
    if (!this.accountRolePieChart || !this.accountRolePieChart.nativeElement) return;

    const ctx = this.accountRolePieChart.nativeElement.getContext('2d');
    if (!ctx) return;

    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Admin', 'User'],
        datasets: [{
          data: [this.adminAccounts, this.userAccounts],
          backgroundColor: ['#A6CDC6', '#1F7D53'],
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
        },
      },
    });
  }

  renderRevenueChart(): void {
    // Vẽ biểu đồ doanh thu
    if (!this.revenueBarChart || !this.revenueBarChart.nativeElement) return;

    const ctx = this.revenueBarChart.nativeElement.getContext('2d');
    if (!ctx) return;

    // Destroy the existing chart if it exists
    if (this.currentChart) {
      this.currentChart.destroy();
    }

    const labels = this.monthlyRevenue.map((item) => item.month);
    const data = this.monthlyRevenue.map((item) => item.revenue);

    this.currentChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Doanh thu (VND)',
            data,
            backgroundColor: '#2E5077',
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
        },
        scales: {
          x: { title: { display: true, text: 'Tháng' } },
          y: { title: { display: true, text: 'Doanh thu (VND)' } },
        },
      },
    });
  }

  renderProfitChart(): void {
    // Vẽ biểu đồ lợi nhuận
    if (!this.revenueBarChart || !this.revenueBarChart.nativeElement) return;

    const ctx = this.revenueBarChart.nativeElement.getContext('2d');
    if (!ctx) return;

    // Destroy the existing chart if it exists
    if (this.currentChart) {
      this.currentChart.destroy();
    }

    const labels = this.monthlyProfit.map((item) => item.month);
    const data = this.monthlyProfit.map((item) => item.profit);

    this.currentChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Lợi nhuận (VND)',
            data,
            backgroundColor: '#1F7D53',
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
        },
        scales: {
          x: { title: { display: true, text: 'Tháng' } },
          y: { title: { display: true, text: 'Lợi nhuận (VND)' } },
        },
      },
    });
  }

  showNotification(modalContent: any, message: string): void {
    // Hiển thị thông báo trong modal
    this.notificationMessage = message;
    this.modalService.open(modalContent, { windowClass: 'top-modal' });
  }

  filterOrders(modalContent: any): void {
    // Lọc đơn hàng theo khoảng thời gian
    const today = new Date();

    if (!this.startDate || !this.endDate) {
        this.showNotification(modalContent, 'Vui lòng chọn khoảng thời gian hợp lệ!');
        return;
    }

    if (new Date(this.endDate) < new Date(this.startDate)) {
        this.showNotification(modalContent, 'Ngày đến phải sau ngày từ!');
        return;
    }

    if (new Date(this.startDate) > today || new Date(this.endDate) > today) {
        this.showNotification(modalContent, 'Không được chọn ngày vượt quá ngày hiện tại!');
        return;
    }

    this.statisticsService.getOrderStatisticsByDateRange(this.startDate, this.endDate).subscribe((orders: any[]) => {
        this.filteredOrders = orders;
        this.totalOrdertatistics = orders.length;
        this.totalOrderAmount = orders.reduce((sum, order) => sum + order.intomoney, 0);
        this.currentPage = 1;
        this.updatePagination();
    });
  }

  loadAllOrders(): void {
    // Tải toàn bộ đơn hàng
    this.statisticsService.getAllOrders().subscribe((orders: any[]) => {
        this.filteredOrders = orders;
        this.totalOrderAmount = orders.reduce((sum, order) => sum + order.intomoney, 0);
        this.updatePagination();
    });
  }

  updatePagination(): void {
    // Cập nhật phân trang cho danh sách đơn hàng
    this.totalPages = Math.ceil(this.filteredOrders.length / this.itemsPerPage);
    this.paginatedOrders = this.filteredOrders.slice((this.currentPage - 1) * this.itemsPerPage, this.currentPage * this.itemsPerPage);
    this.pages = this.generatePageNumbers();
  }

  generatePageNumbers(): number[] {
    // Tạo danh sách số trang hiển thị
    const maxVisiblePages = 5;
    const pages: number[] = [];

    if (this.totalPages <= maxVisiblePages) {
        for (let i = 1; i <= this.totalPages; i++) {
            pages.push(i);
        }
    } else {
        if (this.currentPage <= 3) {
            pages.push(1, 2, 3, 4, -1, this.totalPages);
        } else if (this.currentPage >= this.totalPages - 2) {
            pages.push(1, -1, this.totalPages - 3, this.totalPages - 2, this.totalPages - 1, this.totalPages);
        } else {
            pages.push(1, -1, this.currentPage - 1, this.currentPage, this.currentPage + 1, -1, this.totalPages);
        }
    }

    return pages;
  }

  changePage(page: number): void {
    // Chuyển đến trang cụ thể
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagination();
  }

  goToFirstPage(): void {
    // Chuyển đến trang đầu tiên
    this.changePage(1);
  }

  goToLastPage(): void {
    // Chuyển đến trang cuối cùng
    this.changePage(this.totalPages);
  }

  exportOrdersToExcel() {
    // Xuất danh sách đơn hàng ra file Excel
    const worksheet = XLSX.utils.json_to_sheet(this.filteredOrders);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');
    XLSX.writeFile(workbook, 'Orders_Report.xlsx');
  }

  filterImports(modalContent: any): void {
    // Lọc danh sách nhập khẩu theo khoảng thời gian
    const today = new Date();

    if (!this.startImportDate || !this.endImportDate) {
        this.showNotification(modalContent, 'Vui lòng chọn khoảng thời gian hợp lệ!');
        return;
    }

    if (new Date(this.endImportDate) < new Date(this.startImportDate)) {
        this.showNotification(modalContent, 'Ngày đến phải sau ngày từ!');
        return;
    }

    if (new Date(this.startImportDate) > today || new Date(this.endImportDate) > today) {
        this.showNotification(modalContent, 'Không được chọn ngày vượt quá ngày hiện tại!');
        return;
    }

    this.statisticsService.getImportStatisticsByDateRange(this.startImportDate, this.endImportDate).subscribe((imports: any[]) => {
        this.filteredImports = imports;
        this.totalImportStatistics = imports.reduce((sum, item) => sum + item.quantity, 0); // Fix: Calculate total quantity
        this.totalImportAmount = imports.reduce((sum, item) => sum + item.price * item.quantity, 0);
        this.currentImportPage = 1;
        this.updateImportPagination();
    }, () => {
        this.showNotification(modalContent, 'Đã xảy ra lỗi khi lọc dữ liệu!');
    });
  }

  loadAllImports(): void {
    // Tải toàn bộ danh sách nhập khẩu
    this.statisticsService.getAllImports().subscribe((imports: any[]) => {
        this.filteredImports = imports;
        this.totalImportStatistics = imports.reduce((sum, item) => sum + item.quantity, 0); // Fix: Calculate total quantity
        this.totalImportAmount = imports.reduce((sum, item) => sum + item.price * item.quantity, 0);
        this.updateImportPagination();
    });
  }

  updateImportPagination(): void {
    // Cập nhật phân trang cho danh sách nhập khẩu
    this.totalImportPages = Math.ceil(this.filteredImports.length / this.itemsPerPage);
    this.paginatedImports = this.filteredImports.slice((this.currentImportPage - 1) * this.itemsPerPage, this.currentImportPage * this.itemsPerPage);
    this.importPages = this.generateImportPageNumbers();
  }

  generateImportPageNumbers(): number[] {
    // Tạo danh sách số trang hiển thị cho nhập khẩu
    const maxVisiblePages = 5;
    const pages: number[] = [];

    if (this.totalImportPages <= maxVisiblePages) {
        for (let i = 1; i <= this.totalImportPages; i++) {
            pages.push(i);
        }
    } else {
        if (this.currentImportPage <= 3) {
            pages.push(1, 2, 3, 4, -1, this.totalImportPages);
        } else if (this.currentImportPage >= this.totalImportPages - 2) {
            pages.push(1, -1, this.totalImportPages - 3, this.totalImportPages - 2, this.totalImportPages - 1, this.totalImportPages);
        } else {
            pages.push(1, -1, this.currentImportPage - 1, this.currentImportPage, this.currentImportPage + 1, -1, this.totalImportPages);
        }
    }

    return pages;
  }

  changeImportPage(page: number): void {
    // Chuyển đến trang cụ thể trong danh sách nhập khẩu
    if (page < 1 || page > this.totalImportPages) return;
    this.currentImportPage = page;
    this.updateImportPagination();
  }

  goToFirstImportPage(): void {
    // Chuyển đến trang đầu tiên trong danh sách nhập khẩu
    this.changeImportPage(1);
  }

  goToLastImportPage(): void {
    // Chuyển đến trang cuối cùng trong danh sách nhập khẩu
    this.changeImportPage(this.totalImportPages);
  }

  exportImportsToExcel(): void {
    // Xuất danh sách nhập khẩu ra file Excel
    const worksheet = XLSX.utils.json_to_sheet(this.filteredImports);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Imports');
    XLSX.writeFile(workbook, 'Imports_Report.xlsx');
  }

  exportRevenueToExcel(): void {
    // Xuất dữ liệu doanh thu ra file Excel
    const worksheet = XLSX.utils.json_to_sheet(this.monthlyRevenue);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Revenue');
    XLSX.writeFile(workbook, 'Revenue_Report.xlsx');
  }

  exportProfitToExcel(): void {
    // Xuất dữ liệu lợi nhuận ra file Excel
    const worksheet = XLSX.utils.json_to_sheet(this.monthlyProfit);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Profit');
    XLSX.writeFile(workbook, 'Profit_Report.xlsx');
  }

  sortOrdersBy(field: string): void {
    // Sắp xếp danh sách đơn hàng theo trường cụ thể
    if (this.currentOrderSortField === field) {
        this.currentOrderSortDirection = this.currentOrderSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        this.currentOrderSortField = field;
        this.currentOrderSortDirection = 'asc';
    }

    this.filteredOrders.sort((a, b) => {
        const aValue = field === 'id' ? +a[field] : a[field];
        const bValue = field === 'id' ? +b[field] : b[field];
        if (aValue < bValue) return this.currentOrderSortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return this.currentOrderSortDirection === 'asc' ? 1 : -1;
        return 0;
    });
    this.updatePagination();
  }

  sortImportsBy(field: string): void {
    // Sắp xếp danh sách nhập khẩu theo trường cụ thể
    if (this.currentImportSortField === field) {
        this.currentImportSortDirection = this.currentImportSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        this.currentImportSortField = field;
        this.currentImportSortDirection = 'asc';
    }

    this.filteredImports.sort((a, b) => {
        const aValue = field === 'id' ? +a[field] : a[field];
        const bValue = field === 'id' ? +b[field] : b[field];
        if (aValue < bValue) return this.currentImportSortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return this.currentImportSortDirection === 'asc' ? 1 : -1;
        return 0;
    });
    this.updateImportPagination();
  }
}
