import { Routes } from '@angular/router';
import { ComingsoonComponent } from './share/comingsoon/comingsoon.component';
import { EmployeeComponent } from './features/employee/component/employee.component';
import { AccountComponent } from './features/account/component/account.component';
// import { ImportGoodsComponent } from './features/import-goods/import-goods.component';
// import { OrderManagementComponent } from './features/order-management/order-management.component';
// import { ProductComponent } from './features/product/product.component';
import { ProductCategoryComponent } from './features/product-category/component/product-category.component';
// import { StatisticsReportsComponent } from './features/statistics-reports/statistics-reports.component';
// import { SupplierComponent } from './features/supplier/supplier.component';

export const routes: Routes = [
    { path: 'account', component: AccountComponent },
    // { path: 'importgoods', component: ImportGoodsComponent },
    // { path: 'ordermanagement', component: OrderManagementComponent },
    // { path: 'product', component: ProductComponent },
    { path: 'productcategory', component: ProductCategoryComponent },
    // { path: 'statisticsreports', component: StatisticsReportsComponent },
    // { path: 'supplier', component: SupplierComponent },
    { path: 'employee', component: EmployeeComponent },
    { path: '**', component: ComingsoonComponent },
];
