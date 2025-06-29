import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ILoginSucc } from '../../interfaces/ilogin-succ';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateY(-20px)' }))
      ])
    ])
  ]
})
export class LoginComponent {
  //! variables
  loginForm!: FormGroup;
  isLoading = false;

  //! Injections
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly toastr = inject(ToastrService);

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  get f() { return this.loginForm.controls; }

  //! submit
  onSubmit(): void {
    this.handleSubmit();

    if (this.loginForm.valid) {
      this.isLoading = true;
      const formData = new FormData();
      formData.append('username', this.loginForm.value.username);
      formData.append('password', this.loginForm.value.password);

      this.authService.sendLogin(formData).subscribe({
        next: (res: ILoginSucc) => {
          console.log(res);
          this.toastr.success('Login successful');
          this.loginForm.reset();
          this.isLoading = false;
          localStorage.setItem('token', res.access_token);
          console.log('hello from auth');
          const role = localStorage.getItem('role');
          if (role === 'client') {
            this.router.navigate(['/client/chat-ai']);
          } else if (role === 'lawyer') {
            this.router.navigate(['/lawyer/chat-ai']);
          } else if (role === 'company') {
            this.router.navigate(['/company/chat-ai']);
          } else if (role === 'dashboard') {
            this.router.navigate(['/dashboard/dashboard']);
          } else {
            this.router.navigate(['/login']);
          }
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading = false;
          console.log(err.error);
          console.log(err.error.message);
          // Check for invalid credentials
          if (
            err.status === 401 ||
            (typeof err.error.message === 'string' &&
              (err.error.message.toLowerCase().includes('invalid') ||
               err.error.message.toLowerCase().includes('incorrect') ||
               err.error.message.toLowerCase().includes('not found')))
          ) {
            this.toastr.error('Invalid email or password.', 'Login Failed');
          } else {
            this.toastr.error('Something went wrong. Please try again later.', 'Error');
          }
        },
      });
    }
  }

  handleSubmit() {
    this.loginForm.markAllAsTouched();
  }

  navigateToSignUp() {
    this.router.navigate(['/sign-up']);
  }
}