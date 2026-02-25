import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductDetail } from './product-detail/product-detail.component';
import { ProductForm } from './product-form/product-form.component';
import { AdminGuard } from '../../core/guards/admin.guard';

const routes: Routes = [
  { path: '', component: ProductListComponent },
  { path: 'new', component: ProductForm, canActivate: [AdminGuard] },
  { path: ':id', component: ProductDetail },
  { path: ':id/edit', component: ProductForm, canActivate: [AdminGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductsRoutingModule { }
