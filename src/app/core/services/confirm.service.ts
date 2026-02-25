import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class ConfirmService {

  constructor(private dialog: MatDialog) {}

  confirm(options: ConfirmDialogData): Observable<boolean> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: options,
      disableClose: true,
      backdropClass: 'confirm-backdrop',
      enterAnimationDuration: '200ms',
      exitAnimationDuration: '150ms'
    });

    return dialogRef.afterClosed();
  }
}