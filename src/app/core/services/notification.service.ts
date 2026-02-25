import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SoundService } from './sound.service';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications: Notification[] = [];
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  constructor(private ngZone: NgZone, private soundService: SoundService) {}

  success(message: string, duration: number = 3000): void {
    this.show('success', message, duration);
    this.soundService.playNotification();
  }

  error(message: string, duration: number = 5000): void {
    this.show('error', message, duration);
    this.soundService.playNotification();
  }

  warning(message: string, duration: number = 4000): void {
    this.show('warning', message, duration);
    this.soundService.playNotification();
  }

  info(message: string, duration: number = 3000): void {
    this.show('info', message, duration);
    this.soundService.playNotification();
  }

  private show(type: Notification['type'], message: string, duration: number): void {
    // Run inside Angular zone
    this.ngZone.run(() => {
      const notification: Notification = {
        id: this.generateId(),
        type,
        message,
        duration
      };

      console.log(`Adding notification (in zone):`, notification);
      
      this.notifications = [...this.notifications, notification];
      this.notificationsSubject.next([...this.notifications]);

      // Auto-dismiss
      setTimeout(() => {
        console.log(`Auto-dismissing (in zone):`, notification.id);
        this.clear(notification.id);
      }, duration);
    });
  }

  clear(id: string): void {
    this.ngZone.run(() => {
      console.log(`Clearing notification (in zone):`, id);
      this.notifications = this.notifications.filter(n => n.id !== id);
      this.notificationsSubject.next([...this.notifications]);
    });
  }

  clearAll(): void {
    this.ngZone.run(() => {
      this.notifications = [];
      this.notificationsSubject.next([]);
    });
  }

  private generateId(): string {
    return `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}