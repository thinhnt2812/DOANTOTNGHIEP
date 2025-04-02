import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { CategoryStatistics, EmployeeStatistics, ProductStatistics, SupplierStatistics, AccountStatistics } from './statistics-reports.model';
import { addDays, isAfter } from 'date-fns';

@Injectable({
  providedIn: 'root',
})
export class StatisticsReportsService {
  private baseUrl = 'http://localhost:5000';
  private employeesEndpoint = '/employees';
  private productsEndpoint = '/products';
  private suppliersEndpoint = '/suppliers';
  private categoriesEndpoint = '/product_categorys';
  private accountsEndpoint = '/accounts';
  private importgoodsEndpoint = '/import_goods';
  private importOrderEndpoint = '/orders';

  constructor(private http: HttpClient) {}

  private getStatistics<T>(endpoint: string, processFn: (data: any[]) => T): Observable<T> {
    return this.http.get<any[]>(`${this.baseUrl}${endpoint}`).pipe(map(processFn));
  }

  getEmployeeStatistics(): Observable<EmployeeStatistics> {
    return this.getStatistics(this.employeesEndpoint, (employees) => {
      const totalEmployees = employees.length;
      const activeEmployees = employees.filter((e) => e.status === 'Đang hoạt động').length;
      const resignedEmployees = employees.filter((e) => e.status === 'Đã nghỉ').length;
      const thirtyDaysAgo = addDays(new Date(), -30);
      const newEmployees = employees.filter((e) => isAfter(new Date(e.dow), thirtyDaysAgo)).length;

      return { totalEmployees, activeEmployees, resignedEmployees, newEmployees };
    });
  }

  getProductStatistics(): Observable<ProductStatistics> {
    return this.getStatistics(this.productsEndpoint, (products) => {
      const totalProducts = products.length;
      const activeProducts = products.filter((p) => p.status === 'Đang bán').length;
      const outOfStockProducts = products.filter((p) => p.status === 'Đã dừng').length;
      const notYetSoldProducts = products.filter((p) => p.status === 'Hàng nhập').length;

      return { totalProducts, activeProducts, outOfStockProducts, notYetSoldProducts };
    });
  }

  getImportedProductStatistics(): Observable<number> {
    return this.getStatistics(this.importgoodsEndpoint, (importFoods) => {
      return importFoods.length; 
    });
  }

  getOrdertatistics(): Observable<number> {
    return this.getStatistics(this.importOrderEndpoint, (orders) => {
      return orders.length; 
    });
  }

  getOrderStatisticsByDateRange(startDate: string, endDate: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}${this.importOrderEndpoint}`).pipe(
      map((orders) => {
        return orders.filter((order) => {
          const orderDate = new Date(order.purchasedate);
          return orderDate >= new Date(startDate) && orderDate <= new Date(endDate);
        });
      })
    );
  }

  getAllOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}${this.importOrderEndpoint}`);
  }

  getImportStatisticsByDateRange(startDate: string, endDate: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}${this.importgoodsEndpoint}`).pipe(
        map((imports) => {
            return imports.filter((importItem) => {
                const importDate = new Date(importItem.date);
                return importDate >= new Date(startDate) && importDate <= new Date(endDate);
            });
        })
    );
  }

  getAllImports(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}${this.importgoodsEndpoint}`);
  }

  getSupplierStatistics(): Observable<SupplierStatistics> {
    return this.getStatistics(this.suppliersEndpoint, (suppliers) => {
      const totalSuppliers = suppliers.length;
      const activeSuppliers = suppliers.filter((s) => s.status === 'Đang hợp tác').length;
      const inactiveSuppliers = suppliers.filter((s) => s.status === 'Tạm ngừng hợp tác').length;

      return { totalSuppliers, activeSuppliers, inactiveSuppliers };
    });
  }

  getCategoryStatistics(): Observable<CategoryStatistics> {
    return this.getStatistics(this.categoriesEndpoint, (categories) => {
      const totalCategories = categories.length;
      const activeCategories = categories.filter((c) => c.status === 'Đang hoạt động').length;
      const inactiveCategories = categories.filter((c) => c.status === 'Đã loại bỏ').length;

      return { totalCategories, activeCategories, inactiveCategories };
    });
  }

  getAccountStatistics(): Observable<AccountStatistics> {
    return this.getStatistics(this.accountsEndpoint, (accounts) => {
      const totalAccounts = accounts.length;
      const activeAccounts = accounts.filter((a) => a.status === 'Đang hoạt động').length;
      const inactiveAccounts = accounts.filter((a) => a.status === 'Đã dừng').length;
      const roles = {
        admin: accounts.filter((a) => a.role === 'Admin').length,
        user: accounts.filter((a) => a.role === 'User').length,
      };

      return { totalAccounts, activeAccounts, inactiveAccounts, roles };
    });
  }

  getMonthlyRevenue(): Observable<{ month: string; revenue: number }[]> {
    return this.http.get<any[]>(`${this.baseUrl}${this.importOrderEndpoint}`).pipe(
      map((orders) => {
        const revenueByMonth: { [key: string]: number } = {};

        orders.forEach((order) => {
          const orderDate = new Date(order.purchasedate);
          const monthKey = `${orderDate.getMonth() + 1}/${orderDate.getFullYear()}`;
          revenueByMonth[monthKey] = (revenueByMonth[monthKey] || 0) + order.intomoney;
        });

        return Object.entries(revenueByMonth)
          .map(([month, revenue]) => ({ month, revenue }))
          .sort((a, b) => new Date(`01/${a.month}`) > new Date(`01/${b.month}`) ? 1 : -1);
      })
    );
  }

  getMonthlyProfit(): Observable<{ month: string; profit: number }[]> {
    return this.http.get<any[]>(`${this.baseUrl}${this.importOrderEndpoint}`).pipe(
        switchMap((orders) =>
            this.http.get<any[]>(`${this.baseUrl}${this.productsEndpoint}`).pipe(
                map((products) => {
                    const profitByMonth: { [key: string]: number } = {};

                    orders.forEach((order) => {
                        const product = products.find(p => p.name === order.purchasedproduct);
                        if (product) {
                            const profitPerUnit = product.price - product.importprice; 
                            const totalProfit = profitPerUnit * order.quantity; 
                            const orderDate = new Date(order.purchasedate);
                            const monthKey = `${orderDate.getMonth() + 1}/${orderDate.getFullYear()}`;
                            profitByMonth[monthKey] = (profitByMonth[monthKey] || 0) + totalProfit;
                        }
                    });

                    return Object.entries(profitByMonth)
                        .map(([month, profit]) => ({ month, profit }))
                        .sort((a, b) => new Date(`01/${a.month}`) > new Date(`01/${b.month}`) ? 1 : -1);
                })
            )
        )
    );
  }
}
