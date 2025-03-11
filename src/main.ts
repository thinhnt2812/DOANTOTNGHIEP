import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';
import { LoginComponent } from './app/login/component/login.component';
import { AdminDashboardComponent } from './app/admin-dashboard/admin-dashboard.component';
import { AuthGuard } from './app/login/auth.guard';
import { provideHttpClient } from '@angular/common/http';
import { AccountComponent } from './app/features/account/component/account.component';
import { ProductCategoryComponent } from './app/features/product-category/component/product-category.component';
import { EmployeeComponent } from './app/features/employee/component/employee.component';
import { ComingsoonComponent } from './app/share/comingsoon/comingsoon.component';
import { PageNotFoundComponent } from './app/share/page-not-found/page-not-found.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    provideRouter([
      { path: 'login', component: LoginComponent },
      { path: 'admin', component: AdminDashboardComponent,
          canActivate: [AuthGuard],
          children: [
            { path: 'account', component: AccountComponent },
            { path: 'productcategory', component: ProductCategoryComponent },
            { path: 'employee', component: EmployeeComponent },
            { path: 'comingsoon', component: ComingsoonComponent },
            { path: '**', component: PageNotFoundComponent },
          ]
      },
      { path: '**', redirectTo: 'login' }
    ])
  ]
}).catch(err => console.error(err));
