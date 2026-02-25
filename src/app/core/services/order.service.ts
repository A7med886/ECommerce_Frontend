// core/services/order.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface OrderItem {
  productId: string;
  quantity: number;
}

export interface CreateOrderRequest {
  items: OrderItem[];
  discountCode?: string;
}

export interface CreateOrderResponse {
  orderId: string;
  orderDate: Date;
  subTotal: number;
  discountAmount: number;
  totalAmount: number;
  status: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }>;
}

export interface Order {
  id: string;
  orderDate: Date;
  totalAmount: number;
  status: string;
  itemCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/api/orders`;

  constructor(private http: HttpClient) {}

  createOrder(request: CreateOrderRequest, idempotencyKey: string): Observable<CreateOrderResponse> {
    const headers = { 'Idempotency-Key': idempotencyKey };
    return this.http.post<CreateOrderResponse>(this.apiUrl, request, { headers });
  }

  getMyOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/user`);
  }

  getOrderById(id: string): Observable<CreateOrderResponse> {
    return this.http.get<CreateOrderResponse>(`${this.apiUrl}/${id}`);
  }
}