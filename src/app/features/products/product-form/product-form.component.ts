import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Category, ProductService } from '../../../core/services/product.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Observable } from 'rxjs';
import { LoadingService } from '../../../core/services/loading.service';
import { IdempotencyService } from '../../../core/services/idempotency.service';

@Component({
  selector: 'app-product-form',
  standalone: false,
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss']
})
export class ProductForm implements OnInit {
  productForm: FormGroup;
  loading$: Observable<boolean>;
  isEditMode = false;
  productId?: string;
  private currentIdempotencyKey: string = '';
  categories:Category[] = [];
  // categories = [
  //   { id: "AB187206-4337-4739-BECF-925FFD2F35DB", name: 'Electronics' },
  //   { id: "7B40D22F-538C-4FEB-99FE-D41B6ECE99CB", name: 'Clothing' },
  //   { id: "C6595E30-8926-4B8A-CA8C-08DE6E5B770C", name: 'Books' },
  //   { id: "B730D5AB-D9C9-4BBE-CA8D-08DE6E5B770C", name: 'Home & Garden' }
  // ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private notificationService: NotificationService,
    private loadingService: LoadingService,
    private idempotencyService: IdempotencyService
  ) {
    this.categories = this.productService.categories;
    this.loading$ = this.loadingService.loading$;
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(200)]],
      description: ['', [Validators.required, Validators.maxLength(1000)]],
      price: ['', [Validators.required, Validators.min(0.01)]],
      stock: ['', [Validators.required, Validators.min(0)]],
      categoryId: [null, Validators.required],
      imageUrl: [''],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.productId = id;
      this.loadProduct(this.productId);
    }
  }

  loadProduct(id: string): void {
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        this.productForm.patchValue(product);
      },
      error: () => {
        this.notificationService.error('Product not found');
        this.router.navigate(['/products']);
      }
    });
  }

  compareCategory = (c1: any, c2: any): boolean => {
    return c1?.toUpperCase() === c2?.toUpperCase();
};

  onSubmit(): void {
    if (this.productForm.valid) {
      const productData = this.productForm.value;

      // Only generate a key if we don't have one (the first click)
      if (!this.currentIdempotencyKey) {
        this.currentIdempotencyKey = this.idempotencyService.generateKey();
      }
      const request = this.isEditMode
        ? this.productService.updateProduct(this.productId!, productData)
        : this.productService.createProduct(productData, this.currentIdempotencyKey);

      request.subscribe({
        next: () => {
          this.currentIdempotencyKey = ''; // Reset the key after successful request
          const message = this.isEditMode ? 'Product updated successfully' : 'Product created successfully';
          this.notificationService.success(message);
          this.router.navigate(['/products']);
        },
        error: () => {
        },
        complete: () => {
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/products']);
  }
}