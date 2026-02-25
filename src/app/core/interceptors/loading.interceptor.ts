import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {

  constructor(private loadingService: LoadingService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    // Skip loader if header exists
    if (req.headers.has('X-Skip-Loader')) {
      const newReq = req.clone({
        headers: req.headers.delete('X-Skip-Loader')
      });
      return next.handle(newReq);
    }

    this.loadingService.show();
    
    return next.handle(req).pipe(
      finalize(() => this.loadingService.hide())
    );
  }
}