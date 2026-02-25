import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OrderService, Order } from '../../../core/services/order.service';
import { Observable } from 'rxjs';
import { LoadingService } from '../../../core/services/loading.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-order-list',
  standalone: false,
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss']
})
export class OrderList implements OnInit {
  orders: Order[] = [];
  loading$: Observable<boolean>;
  displayedColumns: string[] = ['orderId', 'date', 'items', 'total', 'status', 'actions'];

  constructor(
    private orderService: OrderService,
    private router: Router,
    private loadingService: LoadingService,
    private notificationService: NotificationService
  ) {
    this.loading$ = this.loadingService.loading$;
  }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.orderService.getMyOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
      },
      error: () => {
        this.notificationService.error('Failed to load orders. Please try again later.');
      }
    });
  }

  viewOrder(orderId: string): void {
    this.router.navigate(['/orders', orderId]);
  }

  getStatusColor(status: string): string {
    const statusMap: { [key: string]: string } = {
      'Pending': 'warn',
      'Confirmed': 'primary',
      'Processing': 'accent',
      'Shipped': 'accent',
      'Delivered': 'primary',
      'Cancelled': 'warn'
    };
    return statusMap[status] || '';
  }
}