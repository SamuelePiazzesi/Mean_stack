import { ErrorComponent } from './error/error.component';

import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';




@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private dialog: MatDialog) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {


    // copio la mia req con il metodo clone() cosi non la manipolo direttamente e la edito anche

    return next.handle(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Errore sconosciuto';
      if (error.error.message) {
          errorMessage = error.error.message;
      }
      this.dialog.open(ErrorComponent, {data: {message: errorMessage}});
      return throwError(error);
    }));
  }
}
