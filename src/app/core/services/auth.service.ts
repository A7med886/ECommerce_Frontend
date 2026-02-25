import { Injectable } from '@angular/core';
import { LoginRequest } from '../models/login-request.model';
import { LoginResponse } from '../models/login-response.model';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { DecodedToken } from '../models/decoded-token.model';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../../environments/environment';
import { CartService } from './cart.service';
import { RegisterRequest, RegisterResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})

export class AuthService {
  private apiUrl = `${environment.apiUrl}/api/auth`;
  private currentUserSubject = new BehaviorSubject<LoginResponse | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private tokenRefreshTimer?: any;
  private isRefreshing = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private cartService: CartService
  ) {
    this.loadStoredUser();
  }

  private loadStoredUser(): void {
    const token = this.getToken();

    if (!token) {
      this.currentUserSubject.next(null);
      return;
    }

    if (!this.isTokenExpired(token)) {
      const user = this.buildUserFromToken(token);
      if (user) {
        this.currentUserSubject.next(user);
        this.scheduleTokenRefresh(token);
      }
      return;
  }

  // Token expired => attempt refresh
  this.refreshToken().subscribe({
    error: () => this.logout()
  });
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          this.storeTokens(response);
          this.currentUserSubject.next(response);
          this.scheduleTokenRefresh(response.token);
        }),
        catchError(error => {
          console.error('Login error:', error);
          return throwError(() => error);
        })
      );
  }

  register(userData: RegisterRequest, idempotencyKey: string): Observable<RegisterResponse> {
    const headers = { 'Idempotency-Key': idempotencyKey };
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, userData, { headers });
  }

  refreshToken(): Observable<LoginResponse> {
    if (this.isRefreshing) {
      // Prevent multiple simultaneous refresh attempts
      return throwError(() => new Error('Token refresh already in progress'));
    }

    const token = this.getToken();
    const refreshToken = this.getRefreshToken();

    if (!token || !refreshToken) {
      return throwError(() => new Error('No tokens available'));
    }

    this.isRefreshing = true;

    const headers = { 'X-Skip-Loader': `` };
    return this.http.post<LoginResponse>(`${this.apiUrl}/refresh-token`, {
      token,
      refreshToken
    }, 
    { headers })
    .pipe(
      tap(response => {
        this.storeTokens(response);
        this.currentUserSubject.next(response);
        this.scheduleTokenRefresh(response.token);
        this.isRefreshing = false;
      }),
      catchError(error => {
        console.error('Token refresh failed:', error);
        this.isRefreshing = false;
        this.logout();
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    this.cartService.clearCart();
    this.currentUserSubject.next(null);
    // this.router.navigate(['/login']);

    // Clear refresh timer
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
    }

    // Small delay to ensure cleanup completes
    setTimeout(() => {
      this.router.navigate(['/auth/login']);
    }, 100);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return token !== null && !this.isTokenExpired(token);
  }

  isAdmin(): boolean {
    const token = this.getToken();
    if (!token) return false;

    const decoded: DecodedToken = jwtDecode(token);
    return decoded.role === 'Admin';
  }

  private storeTokens(response: LoginResponse): void {
    localStorage.setItem('token', response.token);
    localStorage.setItem('refreshToken', response.refreshToken);
  }

  private buildUserFromToken(token: string): LoginResponse {
    const decoded: DecodedToken = jwtDecode(token);

    return {
      token,
      refreshToken: this.getRefreshToken()!,
      email: decoded.email,
      role: decoded.role,
      firstName: decoded.firstName,
      lastName: decoded.lastName
    };
  }
  private isTokenExpired(token: string): boolean {
    try {
      const decoded: DecodedToken = jwtDecode(token);
      const expirationDate = new Date(decoded.exp * 1000);
      return expirationDate < new Date();
    } catch {
      return true;
    }
  }

  private scheduleTokenRefresh(token: string): void {
    // Clear existing timer
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
    }

    try {
      const decoded: DecodedToken = jwtDecode(token);
      const expirationDate = new Date(decoded.exp * 1000);
      const now = new Date();
      
      // Refresh at 70% of token lifetime or 2 minutes before expiration, whichever is sooner
      const tokenLifetime = expirationDate.getTime() - now.getTime();
      const twoMinutes = 2 * 60 * 1000;

      if (tokenLifetime <= 0) {
        this.refreshToken();
        return;
      }

      let refreshTime;
      if (tokenLifetime > twoMinutes) {
        refreshTime = tokenLifetime - twoMinutes;
      } else {
        refreshTime = tokenLifetime * 0.7; // 70% rule for short tokens
      }

      refreshTime = Math.max(refreshTime, 0);
      
      if (refreshTime > 0) {
        console.log(`Token will refresh in ${Math.round(refreshTime / 1000)} seconds`);
        
        this.tokenRefreshTimer = setTimeout(() => {
          console.log('Auto-refreshing token...');
          this.refreshToken().subscribe({
            next: () => console.log('Token refreshed successfully'),
            error: (error) => console.error('Auto-refresh failed:', error)
          });
        }, refreshTime);
      }
    } catch (error) {
      console.error('Error scheduling token refresh:', error);
    }
  }
}
