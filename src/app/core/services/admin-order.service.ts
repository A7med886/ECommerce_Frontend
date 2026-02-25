import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AdminOrderDto {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  orderDate: Date;
  subTotal: number;
  discountAmount: number;
  totalAmount: number;
  status: string;
  itemCount: number;
}

export interface PagedResult<T> {
  items: T[];
  totalItems: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface OrderQueryParams {
  pageNumber: number;
  pageSize: number;
  status?: string;
  searchTerm?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminOrderService {
  private apiUrl = `${environment.apiUrl}/api/orders`;

  constructor(private http: HttpClient) {}

  getAllOrders(params: OrderQueryParams): Observable<PagedResult<AdminOrderDto>> {
    let httpParams = new HttpParams()
      .set('pageNumber', params.pageNumber.toString())
      .set('pageSize', params.pageSize.toString());

    if (params.status) {
      httpParams = httpParams.set('status', params.status);
    }
    if (params.searchTerm) {
      httpParams = httpParams.set('searchTerm', params.searchTerm);
    }

    return this.http.get<PagedResult<AdminOrderDto>>(this.apiUrl, { params: httpParams });
  }

  updateOrderStatus(orderId: string, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${orderId}/status`, { status });
  }
}