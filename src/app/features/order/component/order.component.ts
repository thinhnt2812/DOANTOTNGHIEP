import { Component, OnInit } from '@angular/core';
import { OrderService } from '../order.service';
import { Order } from '../order.model';
import { ProductService } from '../../product/product.service';
import { ProductCategoryService } from '../../product-category/product-category.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-order',
  imports: [CommonModule, FormsModule],
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css']
})
export class OrderComponent implements OnInit {
  // Đối tượng lưu thông tin đơn hàng
  order: Order = {
    id: '',
    customername: '',
    customerphone: '',
    purchasedate: '',
    purchasedproduct: '',
    productcategory: '',
    quantity: 1,
    unitprice: 0,
    intomoney: 0
  };

  // Danh sách các đơn hàng, sản phẩm, danh mục
  orders: Order[] = [];
  products: any[] = [];
  filteredProducts: any[] = [];
  categories: any[] = [];
  productSearch: string = '';
  validationMessage: string = '';
  selectedProduct: any = null;
  createdOrder: any = null; 
  modalTitle: string = '';

  constructor(
    private orderService: OrderService, 
    private productService: ProductService, 
    private productCategoryService: ProductCategoryService, 
    private modalService: NgbModal
  ) {}

  ngOnInit() {
    // Đặt tiêu đề trang
    document.title = 'Bán hàng';
    // Lấy ngày hiện tại
    this.order.purchasedate = new Date().toISOString().split('T')[0];
    this.loadOrders();
    this.loadProducts();
    this.loadCategories();
  }

  // Tăng số lượng sản phẩm
  increaseQuantity() {
    this.order.quantity++;
    this.calculateTotalPrice();
  }

  // Giảm số lượng sản phẩm
  decreaseQuantity() {
    if (this.order.quantity > 1) {
      this.order.quantity--;
      this.calculateTotalPrice();
    }
  }

  // Kiểm tra và cập nhật số lượng sản phẩm
  onQuantityChange() {
    if (this.order.quantity < 1) this.order.quantity = 1;
    this.calculateTotalPrice();
  }

  // Tải danh sách đơn hàng từ server
  loadOrders() {
    this.orderService.getOrders().subscribe(data => this.orders = data);
  }

  // Tải danh sách sản phẩm từ server
  loadProducts() {
    this.productService.getProducts().subscribe(data => {
      this.products = data.filter(product => product.status === 'Đang bán');
      this.filteredProducts = this.products;
      this.onProductSearch();
    });
  }

  // Tải danh sách danh mục sản phẩm từ server
  loadCategories() {
    this.productCategoryService.getCategories().subscribe(data => {
      this.categories = data.filter(category => category.status === 'Đang hoạt động');
      this.onProductSearch();
    });
  }

  // Lọc sản phẩm theo danh mục
  onCategoryChange() {
    const selectedCategory = this.order.productcategory;
    this.productService.getProducts().subscribe(data => {
      this.products = selectedCategory 
        ? data.filter(product => product.status === 'Đang bán' && product.type === selectedCategory)
        : data.filter(product => product.status === 'Đang bán');
      this.filteredProducts = this.products;
      this.onProductSearch();
    });
  }

  // Tìm kiếm sản phẩm theo tên
  onProductSearch() {
    this.filteredProducts = this.products.filter(product => product.name.toLowerCase().includes(this.productSearch.toLowerCase()));
  }

  // Cập nhật giá sản phẩm khi chọn sản phẩm
  onProductChange() {
    const selectedProduct = this.products.find(product => product.name === this.order.purchasedproduct);
    if (selectedProduct) {
      this.order.unitprice = selectedProduct.price;
      this.calculateTotalPrice();
    }
  }

  // Chọn sản phẩm từ danh sách
  onProductSelect(product: any) {
    this.order.purchasedproduct = product.name;
    this.order.unitprice = product.price;
    this.selectedProduct = product;
    this.calculateTotalPrice();
  }

  // Tính tổng tiền
  calculateTotalPrice() {
    this.order.intomoney = this.order.quantity * this.order.unitprice;
  }

  // Mở modal hiển thị thông báo
  openModal(content: any, title: string) {
    this.modalTitle = title;
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' });
  }

  // Xử lý khi gửi đơn hàng
  onSubmit(content: any) {
    const phonePattern = /^[0-9]+$/;
    if (!this.order.customername || !this.order.customerphone || !this.order.purchasedproduct || this.order.quantity <= 0 || this.order.unitprice <= 0) {
      this.validationMessage = 'Vui lòng điền đầy đủ thông tin!';
      this.openModal(content, 'Chưa điền đầy đủ thông tin');
      return;
    }
    if (!phonePattern.test(this.order.customerphone)) {
      this.validationMessage = 'Số điện thoại phải là số!';
      this.openModal(content, 'Lỗi tạo đơn hàng');
      return;
    }
    if (this.selectedProduct && this.order.quantity > this.selectedProduct.quantity) {
      this.validationMessage = `Số lượng sản phẩm không đủ! Hiện tại chỉ còn ${this.selectedProduct.quantity} sản phẩm.`;
      this.openModal(content, 'Sản phẩm đã đạt giới hạn');
      return;
    }
    const maxId = this.orders.length > 0 ? Math.max(...this.orders.map(p => parseInt(p.id))) : 0;
    this.order.id = (maxId + 1).toString();
    this.calculateTotalPrice();

    const orderToSave = { ...this.order };
    delete orderToSave.productcategory;

    this.orderService.addOrder(orderToSave).subscribe(response => {
      this.createdOrder = response; 
      this.openModal(content, 'Tạo đơn hàng thành công');

      if (this.selectedProduct) {
        const updatedProduct = { ...this.selectedProduct, quantity: this.selectedProduct.quantity - this.order.quantity };
        this.productService.updateProduct(updatedProduct).subscribe(() => this.loadProducts());
      }

      this.resetOrder();
    });
  }

  // Đặt lại trạng thái đơn hàng
  resetOrder() {
    this.order = {
      id: '',
      customername: '',
      customerphone: '',
      purchasedate: new Date().toISOString().split('T')[0],
      purchasedproduct: '',
      productcategory: '',
      quantity: 0,
      unitprice: 0,
      intomoney: 0
    };
    this.productSearch = '';
    this.selectedProduct = null;
    this.filteredProducts = this.products;
    this.loadOrders();
    this.loadProducts();
  }

  // In hóa đơn
  printOrder() {
    if (!this.createdOrder) {
      alert("Không có đơn hàng để in.");
      return;
    }
  
    const printContent = `
      <html>
        <head>
          <title>Hóa đơn</title>
          <style>
            .order_print { padding: 20px 0; width: 70%; margin: auto; font-family: Arial, sans-serif; }
            .print_top { display: flex; margin-bottom: 10px; }
            .top_img { width: 50%; text-align: center; }
            .top_img img { width: 50%; height: 100px; object-fit: contain; }
            .top_address { width: 50%; display: flex; justify-content: center; align-items: center; flex-direction: column; }
            .top_address p { margin-bottom: 8px; }
            .print_tt { display: flex; justify-content: center; align-items: center; flex-direction: column; padding-bottom: 10px; }
            .print_tt h3 { text-transform: uppercase; }
            .print_user { padding: 10px 0; border-bottom: 1px dashed #333; display: flex; flex-wrap: wrap; }
            .print_user p { width: 50%; margin-bottom: 8px; font-weight: bold; }
            .print_user span { font-weight: 400; }
            .print_product { padding: 10px 0; border-bottom: 1px dashed #333; }
            .print_product_title { display: flex; justify-content: space-between; padding: 10px 0; }
            .print_product_title p { margin-bottom: 0; width: 20%; }
            .print_product_title p:nth-child(1) { width: 40%; }
            .print_product_title:nth-child(1) p { font-weight: bold; }
            .print_buttom { display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 10px 0; }
          </style>
        </head>
        <body>
          <div class="order_print">
            <div class="print_top">
              <div class="top_img"><img src="/assets/image/logo.png" alt="Logo"></div>
              <div class="top_address"><p>Xã Nghĩa Minh</p><p>Nghĩa Đàn, Nghệ An</p></div>
            </div>
            <div class="print_tt"><h3>Hóa đơn bán hàng</h3></div>
            <div class="print_user">
              <p>Ngày mua: <span>${this.createdOrder.purchasedate}</span></p>
              <p>Số hóa đơn: <span>${this.createdOrder.id}</span></p>
              <p>Họ tên khách hàng: <span>${this.createdOrder.customername}</span></p>
              <p>Số điện thoại: <span>${this.createdOrder.customerphone}</span></p>
            </div>
            <div class="print_product">
              <div class="print_product_title">
                <p>Tên sản phẩm</p><p>Đơn giá</p><p>Số lượng</p><p>Thành tiền</p>
              </div>
              <div class="print_product_title">
                <p>${this.createdOrder.purchasedproduct}</p>
                <p>${this.createdOrder.unitprice.toLocaleString()}đ</p>
                <p>${this.createdOrder.quantity}</p>
                <p>${this.createdOrder.intomoney.toLocaleString()}đ</p>
              </div>
            </div>
            <div class="print_buttom">
              <h3>Cảm ơn quý khách và hẹn gặp lại!</h3>
              <div class="print_button info">
                <span style="margin-right: 20px;">SĐT: 0374341386</span>
                <span>Website: www.thinhnt.com</span>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
        printWindow.onafterprint = () => printWindow.close();
      }, 500);
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const closeIcon = document.querySelector(".icon_close_mbl");
  const closeIconI = closeIcon?.querySelector("i");
  const elementsToHide = document.querySelectorAll(".left_top_top, .left_buttom");

  if (closeIcon) {
    closeIcon.addEventListener("click", () => {
      let isHidden = false;
      elementsToHide.forEach(element => {
        if (element instanceof HTMLElement) {
          if (element.style.display === "none") {
            element.style.display = element.classList.contains("left_top_top") ? "flex" : "block";
          } else {
            element.style.display = "none";
            isHidden = true;
          }
        }
      });

      if (closeIconI) {
        closeIconI.classList.toggle("fa-xmark", !isHidden);
        closeIconI.classList.toggle("fa-bars", isHidden);
      }
    });
  }
});
