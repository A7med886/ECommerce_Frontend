import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class Navbar implements OnInit {
  isAuthenticated$!: Observable<boolean>;
  isAdmin$!: Observable<boolean>;
  cartCount$!: Observable<number>;
  userName$!: Observable<string>;

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isAuthenticated$ = this.authService.currentUser$.pipe(
      map(user => user !== null)
    );

    this.isAdmin$ = this.authService.currentUser$.pipe(
      map(user => user?.role === 'Admin')
    );

    this.userName$ = this.authService.currentUser$.pipe(
      map(user => user ? `${user.firstName} ${user.lastName}` : '')
    );

    this.cartCount$ = this.cartService.cart$.pipe(
      map(items => items.reduce((count, item) => count + item.quantity, 0))
    );
  }

  logout(): void {
    this.authService.logout();
  }

  goToCart(): void {
    this.router.navigate(['/cart']);
  }

  goToOrders(): void {
    this.router.navigate(['/orders']);
  }

  goToProducts(): void {
    this.router.navigate(['/products']);
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}