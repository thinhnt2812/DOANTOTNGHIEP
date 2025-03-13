import { Component, OnInit } from '@angular/core';
import { OrderService } from '../order.service';
import { Order } from '../order.model';
import { ProductService } from '../../product/product.service'; // Import ProductService
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
    purchasedate: new Date(),
    purchasedproduct: '',
    quantity: 0,
    unitprice: 0,
    intomoney: 0
  };

  orders: Order[] = [];
  products: any[] = [];

  constructor(private orderService: OrderService, private productService: ProductService) {}

  ngOnInit() {
    this.orderService.getOrders().subscribe(data => {
      this.orders = data;
    });

    this.productService.getProducts().subscribe(data => {
      this.products = data.filter(product => product.status === 'Đang bán');
    });
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

  onSubmit() {
    const maxId = this.orders.length > 0 ? Math.max(...this.orders.map(p => parseInt(p.id))) : 0;
    this.order.id = (maxId + 1).toString();
    this.calculateTotalPrice();

    this.orderService.addOrder(this.order).subscribe(response => {
      console.log('Order added:', response);
      // Reset the form
      this.order = {
        id: '',
        customername: '',
        customerphone: '',
        purchasedate: new Date(),
        purchasedproduct: '',
        quantity: 0,
        unitprice: 0,
        intomoney: 0
      };
      // Refresh the orders list
      this.orderService.getOrders().subscribe(data => {
        this.orders = data;
      });
    });
  }
}
