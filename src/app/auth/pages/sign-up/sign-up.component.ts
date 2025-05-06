import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

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

  //! Injections
  private readonly router = inject(Router);
  _formGroup = inject(FormBuilder);


  ngOnInit(): void {
    this.signUpForm();
  }

 //! validation
  signUpForm():void {
    this.signupForm = this._formGroup.group({
      accountType: [null, Validators.required],
      firstName: [null, [Validators.required, Validators.minLength(2)]],
      lastName: [null, [Validators.required, Validators.minLength(2)]],
      email: [null, [Validators.required, Validators.email]],
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
  onSubmit() {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    // Simulate signup logic
    setTimeout(() => {
      this.isLoading = false;
      console.log('Signup data:', this.signupForm.value);
      this.router.navigate(['/login']);
    }, 1000);
  }

  //! Navigate to Login
  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}
