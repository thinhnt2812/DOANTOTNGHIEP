import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';
import { LoginComponent } from './app/login/component/login.component';
import { AdminDashboardComponent } from './app/dashboard/admin-dashboard/admin-dashboard.component';
import { AuthGuard } from './app/login/auth.guard';
import { provideHttpClient } from '@angular/common/http';
import { AccountComponent } from './app/features/account/component/account.component';
import { ProductCategoryComponent } from './app/features/product-category/component/product-category.component';
import { ProductComponent } from './app/features/product/component/product.component';
import { EmployeeComponent } from './app/features/employee/component/employee.component';
import { SupplierComponent } from './app/features/supplier/component/supplier.component';
import { PageNotFoundComponent } from './app/share/page-not-found/page-not-found.component';
import { ImportGoodsComponent } from './app/features/import-goods/component/import-goods.component';
import { UserDashboardComponent } from './app/dashboard/user-dashboard/user-dashboard.component';
import { UserNotFoundComponent } from './app/share/user/user-not-found/user-not-found.component';
import { OrderComponent } from './app/features/order/component/order.component';
import { OrderManagementComponent } from './app/features/order-management/component/order-management.component';
import { StatisticsReportsComponent } from './app/features/statistics-reports/component/statistics-reports.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    provideRouter([
      { path: 'login', component: LoginComponent },
      { path: 'admin', component: AdminDashboardComponent,
          canActivate: [AuthGuard],
          children: [
            { path: 'employee', component: EmployeeComponent },
            { path: 'supplier', component: SupplierComponent },
            { path: 'product', component: ProductComponent },
            { path: 'productcategory', component: ProductCategoryComponent },
            { path: 'importgoods', component: ImportGoodsComponent },
            { path: 'account', component: AccountComponent },
            { path: 'ordermanagement', component: OrderManagementComponent },
            { path: 'statisticsreports', component: StatisticsReportsComponent },
            { path: '**', component: PageNotFoundComponent },
          ]
      },
      { path: 'user', component: UserDashboardComponent,
        canActivate: [AuthGuard],
        children: [
          { path: 'order', component: OrderComponent },
          { path: '**', component: UserNotFoundComponent },
        ]
      },
      { path: '**', redirectTo: 'login' }
    ])
  ]
}).catch(err => console.error(err));
