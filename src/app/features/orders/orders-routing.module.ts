import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrderList } from './order-list/order-list.component';
import { OrderDetail } from './order-detail/order-detail.component';
import { OrderManagementComponent } from './order-management/order-management.component';
import { AdminGuard } from '../../core/guards/admin.guard';

const routes: Routes = [
  { path: '', component: OrderList },
  { path: 'manage', component: OrderManagementComponent, canActivate: [AdminGuard] },
  { path: ':id', component: OrderDetail }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrdersRoutingModule { }
