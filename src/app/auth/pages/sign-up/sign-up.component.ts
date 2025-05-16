import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface ISuccess {
  message: string;
}

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [RouterLink, CommonModule, ReactiveFormsModule],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css',
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
export class SignUpComponent {
  //! variables
  signupForm!: FormGroup;
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  //! Injections
  private readonly router = inject(Router);
  private readonly _formGroup = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  ngOnInit(): void {
    this.initSignUpForm();
  }

  //! validation
  initSignUpForm(): void {
    this.signupForm = this._formGroup.group({
      role: [null, [Validators.required]],
      first_name: [null, [Validators.required, Validators.minLength(2)]],
      last_name: [null, [Validators.required, Validators.minLength(2)]],
      email: [null, [Validators.required, Validators.email]],
      phone_number: [null, [
        Validators.required,
        Validators.pattern('^[0-9]{11}$'),
        Validators.minLength(11),
        Validators.maxLength(11)
      ]],
      password: [null, [Validators.required, Validators.minLength(8)]],
      confirmPassword: [null, [Validators.required]],
      terms: [false, Validators.requiredTrue]
    }, { validators: this.passwordMatchValidator });
  }

  get f() { return this.signupForm.controls; }

  //! Password Match Validator
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    if (password !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  //! On Submit btn
  onSubmit(): void {
    this.handleSubmit();
    if (this.signupForm.valid) {
      this.isLoading = true;
      console.log(this.signupForm.value);
      this.authService.sendSignUp(this.signupForm.value).subscribe({
        next: (res) => {
          console.log(res);
          this.signupForm.reset();
          this.isLoading = false;
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 1500);
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading = false;
          console.log(err.error);
          console.log(err.error.message);
          this.errorMessage = err.error.message;
        },
      });
    }
  }

  handleSubmit() {
    this.signupForm.markAllAsTouched();
    this.successMessage = '';
    this.errorMessage = '';
  }

  //! Navigate to Login
  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}
