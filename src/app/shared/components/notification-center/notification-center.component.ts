import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SignalRService, Notification } from '../../../core/services/signalr.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-notification-center',
  standalone: false,
  templateUrl: './notification-center.component.html',
  styleUrls: ['./notification-center.component.scss']
})
export class NotificationCenterComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  unreadCount = 0;
  showDropdown = false;
  isAdmin = false;
  private destroy$ = new Subject<void>();

  constructor(
    private signalRService: SignalRService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef  // INJECT ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    
    this.signalRService.notificationHistory$
      .pipe(takeUntil(this.destroy$))
      .subscribe(notifications => {
        console.log('📬 Notification center received update:', notifications.length);
        this.notifications = [...notifications];
        this.cdr.detectChanges();  // FORCE change detection
      });

    this.signalRService.unreadCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        console.log('Unread count update:', count);
        this.unreadCount = count;
        this.cdr.detectChanges();  // FORCE change detection
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  handleNotificationClick(notification: Notification): void {
    if (notification.id) {
      this.signalRService.markAsRead(notification.id);
    }

    if (notification.orderId) {
      this.router.navigate(['/orders', notification.orderId]);
    } else if (notification.productId) {
      this.router.navigate(['/products', notification.productId]);
    }

    this.showDropdown = false;
  }

  markAllAsRead(): void {
    this.signalRService.markAllAsRead();
  }

  clearAll(): void {
    if (confirm('Are you sure you want to clear all notifications?')) {
      this.signalRService.clearHistory();
    }
  }

  getNotificationIcon(notification: Notification): string {
    if (notification.type === 'NewOrder') return 'shopping_cart';
    if (notification.type === 'OrderStatusChanged') return 'local_shipping';
    if (notification.type === 'StockChanged') return 'inventory';
    if (notification.type === 'PriceChanged') return 'attach_money';
    return 'notifications';
  }

  getNotificationColor(notification: Notification): string {
    if (notification.notificationType === 'success') return 'success';
    if (notification.notificationType === 'error') return 'error';
    if (notification.notificationType === 'warning') return 'warning';
    return 'info';
  }
}