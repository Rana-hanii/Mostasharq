import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { NgxSpinnerService } from "ngx-spinner";
import { finalize } from 'rxjs';

export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
  
  const sendMessagePatterns = [
    '/messages',
    '/lawyer-response',
    '/support/chat/',
    'chatttt',
    '/full',
  ];

  
  const isSendMessage = sendMessagePatterns.some(pattern => req.url.includes(pattern));

  if (isSendMessage) {
   
    return next(req);
  }

  const loader = inject(NgxSpinnerService);
  loader.show();

  return next(req).pipe(
    finalize(() => {
      loader.hide();
    })
  );
};
