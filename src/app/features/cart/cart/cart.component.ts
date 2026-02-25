import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService, CartItem } from '../../../core/services/cart.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-cart',
  standalone: false,
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class Cart implements OnInit {
  cartItems: CartItem[] = [];
  displayedColumns: string[] = ['image', 'name', 'price', 'quantity', 'subtotal', 'actions'];

  constructor(
    private cartService: CartService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.cartService.cart$.subscribe(items => {
      this.cartItems = items;
    });
  }

  updateQuantity(productId: string, newQuantity: number): void {
    if (newQuantity < 1) {
      return;
    }
    this.cartService.updateQuantity(productId, newQuantity);
  }

  removeItem(productId: string, productName: string): void {
    this.cartService.removeFromCart(productId);
    this.notificationService.success(`${productName} removed from cart`);
  }

  getTotal(): number {
    return this.cartService.getCartTotal();
  }

  continueShopping(): void {
    this.router.navigate(['/products']);
  }

  proceedToCheckout(): void {
    if (this.cartItems.length === 0) {
      this.notificationService.warning('Your cart is empty');
      return;
    }
    this.router.navigate(['/cart/checkout']);
  }
}