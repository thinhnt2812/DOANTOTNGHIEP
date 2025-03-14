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

  orders: Order[] = [];
  products: any[] = [];
  filteredProducts: any[] = [];
  categories: any[] = [];
  productSearch: string = '';
  validationMessage: string = '';
  selectedProduct: any = null;

  constructor(private orderService: OrderService, private productService: ProductService, private productCategoryService: ProductCategoryService, private modalService: NgbModal) {}

  ngOnInit() {
    document.title = 'Bán hàng';
    this.loadOrders();
    this.loadProducts();
    this.loadCategories();
  }

  increaseQuantity() {
    this.order.quantity++;
    this.calculateTotalPrice();
  }

  decreaseQuantity() {
    if (this.order.quantity > 1) {
      this.order.quantity--;
      this.calculateTotalPrice();
    }
  }

  onQuantityChange() {
    if (this.order.quantity < 1) {
      this.order.quantity = 1;
    }
    this.calculateTotalPrice();
  }

  loadOrders() {
    this.orderService.getOrders().subscribe(data => {
      this.orders = data;
    });
  }

  loadProducts() {
    this.productService.getProducts().subscribe(data => {
      this.products = data.filter(product => product.status === 'Đang bán');
      this.filteredProducts = this.products;
      this.onProductSearch();
    });
  }

  loadCategories() {
    this.productCategoryService.getCategories().subscribe(data => {
      this.categories = data.filter(category => category.status === 'Đang hoạt động');
      this.onProductSearch();
    });
  }

  onCategoryChange() {
    const selectedCategory = this.order.productcategory;
    this.productService.getProducts().subscribe(data => {
      if (selectedCategory === '') {
        this.products = data.filter(product => product.status === 'Đang bán');
      } else {
        this.products = data.filter(product => product.status === 'Đang bán' && product.type === selectedCategory);
      }
      this.filteredProducts = this.products;
      this.onProductSearch();
    });
  }

  onProductSearch() {
    this.filteredProducts = this.products.filter(product => product.name.toLowerCase().includes(this.productSearch.toLowerCase()));
  }

  onProductChange() {
    const selectedProduct = this.products.find(product => product.name === this.order.purchasedproduct);
    if (selectedProduct) {
      this.order.unitprice = selectedProduct.price;
      this.calculateTotalPrice();
    }
  }

  onProductSelect(product: any) {
    this.order.purchasedproduct = product.name;
    this.order.unitprice = product.price;
    this.selectedProduct = product;
    this.calculateTotalPrice();
  }

  calculateTotalPrice() {
    this.order.intomoney = this.order.quantity * this.order.unitprice;
  }

  openModal(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
    }, (reason) => {
    });
  }

  onSubmit(content: any) {
    const phonePattern = /^[0-9]+$/;
    if (!this.order.customername || !this.order.customerphone || !this.order.purchasedproduct || this.order.quantity <= 0 || this.order.unitprice <= 0) {
      this.validationMessage = 'Vui lòng điền đầy đủ thông tin!';
      this.openModal(content);
      return;
    }
    if (!phonePattern.test(this.order.customerphone)) {
      this.validationMessage = 'Số điện thoại phải là số!';
      this.openModal(content);
      return;
    }
    const maxId = this.orders.length > 0 ? Math.max(...this.orders.map(p => parseInt(p.id))) : 0;
    this.order.id = (maxId + 1).toString();
    this.calculateTotalPrice();

    const orderToSave = { ...this.order };
    delete orderToSave.productcategory;

    this.orderService.addOrder(orderToSave).subscribe(response => {
      console.log('Order added:', response);
      this.order = {
        id: '',
        customername: '',
        customerphone: '',
        purchasedate: '',
        purchasedproduct: '',
        productcategory: '',
        quantity: 0,
        unitprice: 0,
        intomoney: 0
      };
      this.productSearch = '';
      this.loadOrders();
      this.loadProducts();
    });
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
