import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil, finalize } from 'rxjs/operators';
import {
  ProductService,
  Product,
  PagedResult,
  ProductQueryParams,
  Category,
} from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { LoadingService } from '../../../core/services/loading.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ConfirmService } from '../../../core/services/confirm.service';

@Component({
  selector: 'app-product-list',
  standalone: false,
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
})
export class ProductListComponent implements OnInit, OnDestroy {
  products: Product[] = [];
   categories:Category[] = [];
  loading$: Observable<boolean>;
  searchControl = new FormControl('');
  private destroy$ = new Subject<void>();

  queryParams: ProductQueryParams = {
    pageNumber: 1,
    pageSize: 12,
    sortBy: 'name',
    isDescending: false,
    categoryId: undefined,
  };

  pagedResult?: PagedResult<Product>;
  isAdmin = false;

  sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'price', label: 'Price' },
    { value: 'createdAt', label: 'Newest' },
  ];

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private router: Router,
    private loadingService: LoadingService,
    private confirmService: ConfirmService
  ) {
    this.categories = this.productService.categories;
    this.loading$ = this.loadingService.loading$;
  }
  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.loadProducts();
    this.setupSearch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearch(): void {
    this.searchControl.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((searchTerm) => {
        this.queryParams.searchTerm = searchTerm || undefined;
        this.queryParams.pageNumber = 1;
        this.loadProducts();
      });
  }

  loadProducts(): void {
    this.productService
      .getProducts(this.queryParams)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.pagedResult = result;
          this.products = result.items;
        },
        error: (error) => {
          console.error('Error loading products:', error);
          // this.notificationService.error('Failed to load products');
        },
      });
  }

  trackByProductId(index: number, product: Product): string {
    return product.id;
  }

  onSortChange(): void {
    this.queryParams.pageNumber = 1;
    this.loadProducts();
  }

  onCategoryChange(): void {
    this.queryParams.pageNumber = 1;
    this.loadProducts();
  }

  toggleSortDirection(): void {
    this.queryParams.isDescending = !this.queryParams.isDescending;
    this.loadProducts();
  }

  onPageChange(page: number): void {
    this.queryParams.pageNumber = page;
    this.loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  addToCart(product: Product, event: Event): void {
    event.stopPropagation();
    if (product.stock === 0) {
      this.notificationService.warning('Product is out of stock');
      return;
    }
    this.cartService.addToCart(product, 1);
    this.notificationService.success(`${product.name} added to cart`);
  }

  viewProduct(productId: string): void {
    this.router.navigate(['/products', productId]);
  }

  editProduct(productId: string, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/products', productId, 'edit']);
  }

  deleteProduct(id: string, event: Event) {
    event.stopPropagation();

    this.confirmService
      .confirm({
        title: 'Delete Product',
        message: 'This action cannot be undone. Do you want to continue?',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        confirmColor: 'warn',
      })
      .subscribe((confirmed) => {
        if (!confirmed) return;

        this.productService.deleteProduct(id).subscribe({
          next: () => {
            this.notificationService.success('Product deleted successfully');
            this.loadProducts();
          },
          error: () => {
            this.notificationService.error('Failed to delete product');
          },
        });
      });
  }

  createProduct(): void {
    this.router.navigate(['/products/new']);
  }

  getPageNumbers(): number[] {
    if (!this.pagedResult) return [];
    const pages = [];
    for (let i = 1; i <= this.pagedResult.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  clearCategory(): void {
  this.queryParams.categoryId = undefined;
  this.queryParams.pageNumber = 1;
  this.queryParams.searchTerm = undefined;
  this.searchControl.setValue('');
  this.queryParams.sortBy = 'name';
  this.queryParams.isDescending = false;
  this.loadProducts();
}
}
