import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Observable } from 'rxjs';
import { LoadingService } from '../../../core/services/loading.service';
import { IdempotencyService } from '../../../core/services/idempotency.service';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  hidePassword = true;
  loading$: Observable<boolean>;
  currentIdempotencyKey: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService,
    private loadingService: LoadingService,
    private idempotencyService: IdempotencyService
  ) {
    // const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    this.loading$ = this.loadingService.loading$;
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.pattern(/^(?=.*[A-Z])(?=.*[0-9]).+$/)]],
      firstName: ['', [Validators.required, Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.maxLength(100)]]
    });
  }

  
  onSubmit(): void {
    if (this.registerForm.valid) {
      // Only generate a key if we don't have one (the first click)
      if (!this.currentIdempotencyKey) {
        this.currentIdempotencyKey = this.idempotencyService.generateKey();
      }
      this.authService.register(this.registerForm.value, this.currentIdempotencyKey).subscribe({
        next: () => {
          this.currentIdempotencyKey = ''; // Reset the key after successful request
          this.notificationService.success('Registration successful! Please login.');
          this.router.navigate(['/auth/login']);
        },
        error: () => {
          // this.notificationService.error('Registration failed. Please try again.');
        },
        complete: () => {
        }
      });
    } else {
      this.markFormGroupTouched(this.registerForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    if (field?.hasError('required')) {
      if (field.errors?.['required']) return `${this.splitCamelCase(fieldName)} is required`;
    }
    if (fieldName === 'email') {
    if (field?.hasError('email')) return 'Invalid email format';
  }

  if (fieldName === 'password') {
    if (field?.hasError('minlength')) return 'Password must be at least 6 characters';
    if (field?.hasError('pattern')) {
      return 'Password must contain at least one uppercase letter and one digit';
    }
  }

  if (field?.hasError('maxlength')) {
    return `${this.splitCamelCase(fieldName)} cannot exceed ${field.errors?.['maxlength'].requiredLength} characters`;
  }
    return '';
  }

  // private capitalize(str: string): string {
  //   return str.charAt(0).toUpperCase() + str.slice(1);
  // }
  private splitCamelCase(str: string): string {
  const result = str.replace(/([A-Z])/g, " $1");
  return result.charAt(0).toUpperCase() + result.slice(1).toLowerCase();
}
}