import { NgModule } from '@angular/core';

import { Routes, RouterModule } from '@angular/router';

import { LoginGuard } from './login.guard';

import { LoginFormComponent } from './login-form/login-form.component';
import { EditingProductListComponent } from './editing-product-list/editing-product-list.component';
import { RingupComponent } from './ringup/ringup.component';
import { TransactionReportComponent } from './transaction-report/transaction-report.component';

const routes: Routes = [
  {path: 'login', component: LoginFormComponent, canActivate: [LoginGuard]},
  {path: 'edit', component: EditingProductListComponent, canActivate: [LoginGuard]},
  {path: 'transactions', component: TransactionReportComponent, canActivate: [LoginGuard]},
  {path: '', component: RingupComponent, canActivate: [LoginGuard], pathMatch: 'full'},
];

@NgModule({
  declarations: [],
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [
    RouterModule
  ],
  providers: [LoginGuard]
})
export class AppRoutingModule { }
