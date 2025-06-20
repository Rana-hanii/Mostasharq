import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
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
  private readonly toastr = inject(ToastrService);

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
      governorate: [null, [Validators.required]],
      license_number: [null],
      password: [null, [Validators.required, Validators.minLength(8)]],
      confirmPassword: [null, [Validators.required]],
      terms: [false, Validators.requiredTrue]
    }, { validators: this.passwordMatchValidator });

    this.signupForm.get('role')?.valueChanges.subscribe((role) => {
      const licenseControl = this.signupForm.get('license_number');
      if (role === 'lawyer') {
        licenseControl?.setValidators([Validators.required]);
      } else {
        licenseControl?.clearValidators();
        licenseControl?.setValue(null);
      }
      licenseControl?.updateValueAndValidity();
    });
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
          this.toastr.success('Account created successfully! You can now log in.', 'Success');
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 1500);
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading = false;
          console.log(err.error);
          console.log(err.error.message);
          // Check for duplicate email error in both message and detail
          const errorMsg = (typeof err.error.message === 'string' ? err.error.message.toLowerCase() : '') +
                           (typeof err.error.detail === 'string' ? err.error.detail.toLowerCase() : '');
          if (errorMsg.includes('email already registered') || errorMsg.includes('duplicate') || errorMsg.includes('email used')) {
            this.toastr.error('This email is already registered.', 'Sign Up Failed');
          } else if (
            err.status === 409 ||
            errorMsg.includes('already exists') ||
            errorMsg.includes('used')
          ) {
            this.toastr.error('This email or phone number is already registered.', 'Sign Up Failed');
          } else {
            this.toastr.error('Something went wrong. Please try again later.', 'Error');
          }
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
