import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService, Product } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Observable } from 'rxjs';
import { LoadingService } from '../../../core/services/loading.service';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmService } from '../../../core/services/confirm.service';

@Component({
  selector: 'app-product-detail',
  standalone: false,
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetail implements OnInit {
  product?: Product;
  loading$: Observable<boolean>;
  isAdmin = false;
  quantity = 1;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private loadingService: LoadingService,
    private confirmService: ConfirmService
  ) {
    this.loading$ = this.loadingService.loading$;
    this.isAdmin = this.authService.isAdmin();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadProduct(id);
        console.log('Route parameter id:', id);
      } else {
        this.notificationService.error('Invalid product ID');
        this.router.navigate(['/products']);
      }
    });
  }

  loadProduct(id: string): void {
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        this.product = product;
        console.log('Product loaded:', product);
      },
      error: () => {
        console.error('Error loading product with id:', id);
        this.notificationService.error('Product not found');
        this.router.navigate(['/products']);
      }
    });
  }

  addToCart(): void {
    if (this.product) {
      if (this.quantity > this.product.stock) {
        this.notificationService.error('Not enough stock available');
        return;
      }
      this.cartService.addToCart(this.product, this.quantity);
      this.notificationService.success(`${this.product.name} added to cart`);
    }
  }

   editProduct(productId: string, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/products', productId, 'edit']);
  }

  deleteProduct(id: string, event: Event) {
    event.stopPropagation();

    this.confirmService.confirm({
      title: 'Delete Product',
      message: 'This action cannot be undone. Do you want to continue?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      confirmColor: 'warn'
    }).subscribe(confirmed => {

      if (!confirmed) return;

      this.productService.deleteProduct(id).subscribe({
        next: () => {
          this.notificationService.success('Product deleted successfully');
          this.router.navigate(['/products']);
        },
        error: () => {
          this.notificationService.error('Failed to delete product');
        }
      });

    });
  }

  incrementQuantity(): void {
    if (this.product && this.quantity < this.product.stock) {
      this.quantity++;
    }
  }

  decrementQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }
}