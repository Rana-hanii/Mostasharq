import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../auth/services/auth.service';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('user_id');

  if (!token || !userId) {
    return true; // Allow access to login/signup if not authenticated
  }

  return authService.getUserData().pipe(
    take(1),
    map((userData) => {
      // Redirect based on user role
      switch (userData.role) {
        case 'client':
          router.navigate(['/client']); // Will redirect to /client/chat-ai due to child route
          break;
        case 'lawyer':
          router.navigate(['/lawyer']); // Will redirect to /lawyer/chat-ai due to child route
          break;
        case 'company':
          router.navigate(['/company']); // Will redirect to /company/chat-ai due to child route
          break;
        case 'dashboard':
          router.navigate(['/dashboard/dashboard']);
          break;
        default:
          router.navigate(['/home']);
      }
      return false; // Prevent access to login/signup
    })
  );
}; 