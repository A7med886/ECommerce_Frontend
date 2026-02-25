import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService, CartItem } from '../../../core/services/cart.service';
import { OrderService, CreateOrderRequest } from '../../../core/services/order.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Observable } from 'rxjs';
import { LoadingService } from '../../../core/services/loading.service';
import { IdempotencyService } from '../../../core/services/idempotency.service';

@Component({
  selector: 'app-checkout',
  standalone: false,
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
  checkoutForm: FormGroup;
  cartItems: CartItem[] = [];
  loading$: Observable<boolean>;
  private currentIdempotencyKey: string = '';

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private orderService: OrderService,
    private notificationService: NotificationService,
    private router: Router,
    private loadingService: LoadingService,
    private idempotencyService: IdempotencyService
  ) {
    this.loading$ = this.loadingService.loading$;
    this.checkoutForm = this.fb.group({
      discountCode: ['']
    });
  }

  ngOnInit(): void {
    this.cartService.cart$.subscribe(items => {
      this.cartItems = items;
      if (items.length === 0) {
        this.router.navigate(['/products']);
      }
    });
  }

  get cartTotal(): number {
    return this.cartService.getCartTotal();
  }

  placeOrder(): void {   
    const orderRequest: CreateOrderRequest = {
      items: this.cartItems.map(item => ({
        productId: item.product.id,
        quantity: item.quantity
      })),
      discountCode: this.checkoutForm.value.discountCode || undefined
    };
    // Only generate a key if we don't have one (the first click)
  if (!this.currentIdempotencyKey) {
    this.currentIdempotencyKey = this.idempotencyService.generateKey();
  }

    this.orderService.createOrder(orderRequest, this.currentIdempotencyKey).subscribe({
      next: (response) => {
        this.currentIdempotencyKey = ''; 
        // this.notificationService.success('Order placed successfully!');
        this.cartService.clearCart();
        this.router.navigate(['/orders', response.orderId]);
      },
      error: (error) => {
        // this.notificationService.error('Failed to place order. Please try again.');
      },
      complete: () => {
      }
    });
  }
}