import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { AdminOrderService, AdminOrderDto, OrderQueryParams } from '../../../core/services/admin-order.service';
import { NotificationService } from '../../../core/services/notification.service';
import { SignalRService } from '../../../core/services/signalr.service';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-order-management',
  standalone: false,
  templateUrl: './order-management.component.html',
  styleUrls: ['./order-management.component.scss']
})
export class OrderManagementComponent implements OnInit, OnDestroy {
  orders: AdminOrderDto[] = [];
  loading$: Observable<boolean>;
  searchControl = new FormControl('');
  private destroy$ = new Subject<void>();

  queryParams: OrderQueryParams = {
    pageNumber: 1,
    pageSize: 20
  };

  totalPages = 0;
  totalItems = 0;

  statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Confirmed', label: 'Confirmed' },
    { value: 'Processing', label: 'Processing' },
    { value: 'Shipped', label: 'Shipped' },
    { value: 'Delivered', label: 'Delivered' },
    { value: 'Cancelled', label: 'Cancelled' }
  ];

  displayedColumns = ['orderId', 'customer', 'orderDate', 'items', 'total', 'status', 'actions'];

  constructor(
    private adminOrderService: AdminOrderService,
    private notificationService: NotificationService,
    private signalRService: SignalRService,
    private loadingService: LoadingService
  ) {
    this.loading$ = this.loadingService.loading$;
  }

  ngOnInit(): void {
    this.loadOrders();
    this.setupSearch();
    this.listenToNewOrders();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearch(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(searchTerm => {
        this.queryParams.searchTerm = searchTerm || undefined;
        this.queryParams.pageNumber = 1;
        this.loadOrders();
      });
  }

  private listenToNewOrders(): void {
    // Auto-refresh when new orders come in
    this.signalRService.newOrderReceived$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        console.log('New order received, refreshing list...');
        this.loadOrders();
      });
  }

  loadOrders(): void {
    this.adminOrderService.getAllOrders(this.queryParams)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.orders = result.items;
          this.totalPages = result.totalPages;
          this.totalItems = result.totalItems;
        },
        error: () => {
        }
      });
  }

  onStatusFilterChange(): void {
    this.queryParams.pageNumber = 1;
    this.loadOrders();
  }

  onPageChange(page: number): void {
    this.queryParams.pageNumber = page;
    this.loadOrders();
  }

  updateOrderStatus(orderId: string, currentStatus: string): void {
    // Show dialog to select new status
    const newStatus = this.getNextStatus(currentStatus);
    if (!newStatus) return;

    this.adminOrderService.updateOrderStatus(orderId, newStatus)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notificationService.success(`Order #${orderId} status updated to ${newStatus}`);
          this.loadOrders();
        },
        error: (error) => {
          this.notificationService.error('Failed to update order status');
          console.error(error);
        }
      });
  }

  private getNextStatus(currentStatus: string): string | null {
    const statusFlow: { [key: string]: string } = {
      'Pending': 'Confirmed',
      'Confirmed': 'Processing',
      'Processing': 'Shipped',
      'Shipped': 'Delivered'
    };
    return statusFlow[currentStatus] || null;
  }

  getStatusColor(status: string): string {
    const colorMap: { [key: string]: string } = {
      'Pending': 'warn',
      'Confirmed': 'primary',
      'Processing': 'accent',
      'Shipped': 'accent',
      'Delivered': 'primary',
      'Cancelled': 'warn'
    };
    return colorMap[status] || '';
  }

  getPageNumbers(): number[] {
    const pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }
}