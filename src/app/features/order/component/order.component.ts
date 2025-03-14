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
    quantity: 0,
    unitprice: 0,
    intomoney: 0
  };

  orders: Order[] = [];
  products: any[] = [];
  filteredProducts: any[] = [];
  categories: any[] = [];
  productSearch: string = '';
  validationMessage: string = '';

  constructor(private orderService: OrderService, private productService: ProductService, private productCategoryService: ProductCategoryService, private modalService: NgbModal) {}

  ngOnInit() {
    this.loadOrders();
    this.loadProducts();
    this.loadCategories();
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
      this.products = data.filter(product => product.status === 'Đang bán' && product.type === selectedCategory);
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
    this.calculateTotalPrice();
  }

  onQuantityChange() {
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
