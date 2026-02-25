// core/interceptors/error.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { NotificationService } from '../services/notification.service';
import { AuthService } from '../services/auth.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private notificationService: NotificationService,
    private authService: AuthService
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An error occurred';

        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = error.error.message;
        } else {
          // Server-side error
          switch (error.status) {
            case 400:
              errorMessage = error.error?.error || 'Bad request';
              break;
            case 401:
              // Don't handle 401 here - let TokenRefreshInterceptor handle it
              // Only show error if it's for auth endpoints
              if (request.url.includes('/auth/')) {
                errorMessage = 'Invalid credentials';
                this.notificationService.error(errorMessage);
              }
              // errorMessage = 'Unauthorized. Please login again.';
              // this.authService.logout();
              // this.router.navigate(['/login']);
              break;
            case 403:
              errorMessage = 'Access forbidden';
              break;
            case 404:
              errorMessage = 'Resource not found';
              break;
            case 500:
              errorMessage = 'Internal server error';
              break;
            default:
              // errorMessage = error.error?.error || 'Something went wrong';
              errorMessage = 'Something went wrong';
          }
        }

        this.notificationService.error(errorMessage);
        return throwError(() => error);
      })
    );
  }
}