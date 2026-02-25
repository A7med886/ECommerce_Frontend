import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  private requestCount = 0;

  show(): void {
    console.log('LoadingService: show called');
    this.requestCount++;
    this.loadingSubject.next(true);
  }

  hide(): void {
    console.log('LoadingService: hide called');
    this.requestCount--;
    if (this.requestCount <= 0) {
      this.loadingSubject.next(false);
      this.requestCount = 0;
    }
  }
}