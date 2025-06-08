import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../auth/services/auth.service';

export const lawyerGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('user_id');

  if (!token || !userId) {
    router.navigate(['/login']);
    return false;
  }

  return authService.getUserData().pipe(
    take(1),
    map((userData) => {
      if (userData.role === 'lawyer') {
        return true;
      }
      router.navigate(['/login']);
      return false;
    })
  );
}; 