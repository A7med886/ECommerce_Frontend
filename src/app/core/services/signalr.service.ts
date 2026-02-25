import { Injectable, OnDestroy, NgZone } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { jwtDecode } from 'jwt-decode';

export interface Notification {
  type: string;
  title?: string;
  message: string;
  notificationType?: 'success' | 'info' | 'warning' | 'error';
  orderId?: string;
  status?: string;
  productId?: string;
  stock?: number;
  price?: number;
  customerName?: string;
  totalAmount?: number;
  userId?: string;
  timestamp: Date;
  read?: boolean;
  id?: string;
}

@Injectable({
  providedIn: 'root',
})
export class SignalRService implements OnDestroy {
  private hubConnection?: HubConnection;
  private destroy$ = new Subject<void>();

  public notifications$ = new Subject<Notification>();
  public orderStatusChanged$ = new Subject<Notification>();
  public newOrderReceived$ = new Subject<Notification>();
  public stockChanged$ = new Subject<Notification>();
  public priceChanged$ = new Subject<Notification>();

  private notificationHistory = new BehaviorSubject<Notification[]>([]);
  public notificationHistory$ = this.notificationHistory.asObservable();

  private unreadCount = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCount.asObservable();

  private connectionState$ = new BehaviorSubject<HubConnectionState>(
    HubConnectionState.Disconnected
  );

  private baseUrl = `${environment.apiUrl}/hubs`;
  private isConnecting = false;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private ngZone: NgZone
  ) {
    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      if (user) {
        console.log('User logged in, connecting SignalR...');
        this.loadNotificationHistory();
        this.startConnection();
        // this.restartConnection();
      } else {
        console.log('User logged out, disconnecting SignalR...');
        this.notificationHistory.next([]); // clear UI state
        this.unreadCount.next(0); // reset unread count
        this.stopConnection();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.stopConnection();
  }

  private async startConnection(): Promise<void> {
    if (this.isConnecting) {
      console.log('Connection already in progress...');
      return;
    }

    if (this.hubConnection?.state === HubConnectionState.Connected) {
      console.log('Already connected to SignalR');
      return;
    }

    if (this.hubConnection) {
      await this.stopConnection();
    }

    const token = this.authService.getToken();
    if (!token) {
      console.warn('No token available, cannot connect SignalR');
      return;
    }

    this.isConnecting = true;

    try {
      this.hubConnection = new HubConnectionBuilder()
        .withUrl(`${this.baseUrl}/app`, {
          accessTokenFactory: () => this.authService.getToken() || '',
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
        .configureLogging(signalR.LogLevel.Information)
        .build();

      this.registerEventHandlers();

      await this.hubConnection.start();
      console.log('SignalR connected to AppHub');
      this.connectionState$.next(HubConnectionState.Connected);
    } catch (error) {
      console.error('SignalR connection failed:', error);
      this.connectionState$.next(HubConnectionState.Disconnected);
    } finally {
      this.isConnecting = false;
    }
  }

  private registerEventHandlers(): void {
    if (!this.hubConnection) return;

    // Wrap ALL SignalR callbacks in ngZone.run()
    this.hubConnection.on('OrderStatusChanged', (data: Notification) => {
      this.ngZone.run(() => {
        console.log('Order status changed (in Angular zone):', data);
        data.id = this.generateId();
        data.read = false;

        this.orderStatusChanged$.next(data);
        this.addToHistory(data);
        this.notificationService.success(data.message);
      });
    });

    this.hubConnection.on('NewOrder', (data: Notification) => {
      this.ngZone.run(() => {
        console.log('New order received (in Angular zone):', data);
        data.id = this.generateId();
        data.read = false;
        data.title = `New Order #${data.orderId}`;
        data.message = `New Order from ${data.customerName} - $${data.totalAmount?.toFixed(2)}`;

        this.newOrderReceived$.next(data);
        this.addToHistory(data);
        this.notificationService.info(data.message);
      });
    });

    this.hubConnection.on('StockChanged', (data: Notification) => {
      this.ngZone.run(() => {
        console.log('Stock changed (in Angular zone):', data);
        data.id = this.generateId();
        this.stockChanged$.next(data);
      });
    });

    this.hubConnection.on('PriceChanged', (data: Notification) => {
      this.ngZone.run(() => {
        console.log('Price changed (in Angular zone):', data);
        data.id = this.generateId();
        this.priceChanged$.next(data);
      });
    });

    this.hubConnection.on('Notification', (data: Notification) => {
      this.ngZone.run(() => {
        console.log('Notification (in Angular zone):', data);
        data.id = this.generateId();
        data.read = false;

        this.notifications$.next(data);
        this.addToHistory(data);

        switch (data.notificationType) {
          case 'success':
            this.notificationService.success(data.message);
            break;
          case 'error':
            this.notificationService.error(data.message);
            break;
          case 'warning':
            this.notificationService.warning(data.message);
            break;
          default:
            this.notificationService.info(data.message);
        }
      });
    });

    this.hubConnection.onreconnecting(() => {
      this.ngZone.run(() => {
        console.log('SignalR reconnecting...');
        this.connectionState$.next(HubConnectionState.Reconnecting);
      });
    });

    this.hubConnection.onreconnected(() => {
      this.ngZone.run(() => {
        console.log('SignalR reconnected');
        this.connectionState$.next(HubConnectionState.Connected);
      });
    });

    this.hubConnection.onclose((error) => {
      this.ngZone.run(() => {
        console.log('SignalR connection closed', error);
        this.connectionState$.next(HubConnectionState.Disconnected);
        this.isConnecting = false;
      });
    });
  }

  async subscribeToProduct(productId: string): Promise<void> {
    if (this.hubConnection?.state === HubConnectionState.Connected) {
      await this.hubConnection.invoke('SubscribeToProduct', productId);
      console.log(`Subscribed to product ${productId}`);
    }
  }

  async unsubscribeFromProduct(productId: string): Promise<void> {
    if (this.hubConnection?.state === HubConnectionState.Connected) {
      await this.hubConnection.invoke('UnsubscribeFromProduct', productId);
      console.log(`Unsubscribed from product ${productId}`);
    }
  }

  async subscribeToOrder(orderId: string): Promise<void> {
    if (this.hubConnection?.state === HubConnectionState.Connected) {
      await this.hubConnection.invoke('SubscribeToOrder', orderId);
      console.log(`Subscribed to order ${orderId}`);
    }
  }

  async unsubscribeFromOrder(orderId: string): Promise<void> {
    if (this.hubConnection?.state === HubConnectionState.Connected) {
      await this.hubConnection.invoke('UnsubscribeFromOrder', orderId);
      console.log(`Unsubscribed from order ${orderId}`);
    }
  }

  private addToHistory(notification: Notification): void {
    const current = this.notificationHistory.value;
    const updated = [notification, ...current].slice(0, 50);
    this.notificationHistory.next(updated);
    this.updateUnreadCount(updated);
    this.saveNotificationHistory(updated);
  }

  private updateUnreadCount(notifications: Notification[]): void {
    const count = notifications.filter((n) => !n.read).length;
    this.unreadCount.next(count);
  }

  private getStorageKey(): string | null {
    const token = this.authService.getToken();
    if (!token) return null;

    try {
      const decoded: any = jwtDecode(token);
      return `notification_history_${decoded.sub}`;
    } catch {
      return null;
    }
  }

  loadNotificationHistory(): void {
    const key = this.getStorageKey();
    if (!key) return;

    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        const history = JSON.parse(stored);
        this.notificationHistory.next(history);
        this.updateUnreadCount(history);
      } catch (error) {
        console.error('Error loading notification history:', error);
      }
    }
  }

  private saveNotificationHistory(notifications: Notification[]): void {
    const key = this.getStorageKey();
    if (!key) return;

    localStorage.setItem(key, JSON.stringify(notifications));
  }

  markAsRead(notificationId: string): void {
    const current = this.notificationHistory.value;
    const updated = current.map((n) => (n.id === notificationId ? { ...n, read: true } : n));
    this.notificationHistory.next(updated);
    this.updateUnreadCount(updated);
    this.saveNotificationHistory(updated);
  }

  markAllAsRead(): void {
    const current = this.notificationHistory.value;
    const updated = current.map((n) => ({ ...n, read: true }));
    this.notificationHistory.next(updated);
    this.updateUnreadCount(updated);
    this.saveNotificationHistory(updated);
  }

  clearHistory(): void {
    this.notificationHistory.next([]);
    this.unreadCount.next(0);

    const key = this.getStorageKey();
    if (key) localStorage.removeItem(key);
  }

  getUnreadCount(): number {
    return this.unreadCount.value;
  }

  private async stopConnection(): Promise<void> {
    try {
      if (this.hubConnection) {
        await this.hubConnection.stop();
        this.hubConnection = undefined;
        console.log('SignalR connection stopped');
      }
      this.connectionState$.next(HubConnectionState.Disconnected);
    } catch (error) {
      console.error('Error stopping connection:', error);
    } finally {
      this.isConnecting = false;
    }
  }

  async restartConnection() {
    await this.stopConnection();
    await this.startConnection();
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  isConnected(): boolean {
    return this.connectionState$.value === HubConnectionState.Connected;
  }

  getConnectionState() {
    return this.connectionState$.asObservable();
  }
}
