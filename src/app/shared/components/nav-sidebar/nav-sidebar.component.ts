import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { map } from 'rxjs/operators';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-nav-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './nav-sidebar.component.html',
  styleUrl: './nav-sidebar.component.css'
})
export class NavSidebarComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  userRole$ = this.authService.getUserData().pipe(
    map(userData => userData.role)
  );

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user_id');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Logout error:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user_id');
        this.router.navigate(['/login']);
      }
    });
  }
}
