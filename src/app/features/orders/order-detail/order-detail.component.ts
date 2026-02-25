import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService, CreateOrderResponse } from '../../../core/services/order.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Observable } from 'rxjs';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-order-detail',
  standalone: false,
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss']
})
export class OrderDetail implements OnInit {
  order?: CreateOrderResponse;
  loading$: Observable<boolean>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private notificationService: NotificationService,
    private loadingService: LoadingService
  ) {
    this.loading$ = this.loadingService.loading$;
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadOrder(id);
        console.log('Route parameter id:', id);
      } else {
        this.notificationService.error('Invalid order ID');
        this.router.navigate(['/products']);
      }
    });
  }

  loadOrder(id: string): void {
    this.orderService.getOrderById(id).subscribe({
      next: (order) => {
        this.order = order;
        console.log('Order loaded:', order);
      },
      error: () => {
        this.notificationService.error('Order not found');
        this.router.navigate(['/orders']);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/orders']);
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