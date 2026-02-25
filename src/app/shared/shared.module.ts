import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { CurrencyFormatPipe } from './pipes/currency-format.pipe';
import { NotificationComponent } from './components/notification/notification.component';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { ConfirmDialogData, ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { NotificationCenterComponent } from './components/notification-center/notification-center.component';
import { MatBadgeModule } from '@angular/material/badge';


@NgModule({
  declarations: [
    CurrencyFormatPipe,
    NotificationComponent,
    LoadingSpinnerComponent,
    ConfirmDialogComponent,
    NotificationCenterComponent,
  ],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatBadgeModule
  ],
  exports: [
    CurrencyFormatPipe,
    NotificationComponent,
    LoadingSpinnerComponent,
    ConfirmDialogComponent,
    NotificationCenterComponent
  ]
})
export class SharedModule { }
