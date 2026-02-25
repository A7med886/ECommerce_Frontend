// core/services/product.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
  categoryName: string;
  imageUrl?: string;
  isActive: boolean;
}
export interface Category {
  id: string;
  name: string;
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

export interface ProductQueryParams {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  categoryId?: string;
  sortBy?: string;
  isDescending?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/api/products`;
  public categories: Category[] = [
    { id: "AB187206-4337-4739-BECF-925FFD2F35DB", name: 'Electronics' },
    { id: "7B40D22F-538C-4FEB-99FE-D41B6ECE99CB", name: 'Clothing' },
    { id: "C6595E30-8926-4B8A-CA8C-08DE6E5B770C", name: 'Books' },
    { id: "B730D5AB-D9C9-4BBE-CA8D-08DE6E5B770C", name: 'Home & Garden' }
  ];
  constructor(private http: HttpClient) {}

  getProducts(params: ProductQueryParams): Observable<PagedResult<Product>> {
    let httpParams = new HttpParams()
      .set('pageNumber', params.pageNumber.toString())
      .set('pageSize', params.pageSize.toString());

    if (params.searchTerm) {
      httpParams = httpParams.set('searchTerm', params.searchTerm);
    }
    if (params.categoryId) {
      httpParams = httpParams.set('categoryId', params.categoryId.toString());
    }
    if (params.sortBy) {
      httpParams = httpParams.set('sortBy', params.sortBy);
    }
    if (params.isDescending !== undefined) {
      httpParams = httpParams.set('isDescending', params.isDescending.toString());
    }

    return this.http.get<PagedResult<Product>>(this.apiUrl, { params: httpParams });
  }

  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  createProduct(product: Partial<Product>, idempotencyKey: string): Observable<Product> {
    const headers = { 'Idempotency-Key': idempotencyKey };
    return this.http.post<Product>(this.apiUrl, product, { headers });
  }

  updateProduct(id: string, product: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product);
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}