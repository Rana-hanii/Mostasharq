import { CommonModule } from '@angular/common';
import { HttpHeaders } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../auth/services/auth.service';
import { NavDarkComponent } from "../../shared/components/nav-dark/nav-dark.component";


interface ApiResponse {
  message: string;
  data?: any;
}

interface IProfile {
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  user_id: number;
  role: string;
  created_at: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavDarkComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  // !variables
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  isLoading = false;
  isPasswordLoading = false;
  userProfile: IProfile | null = null;
  errorMessage: string = '';

  // !services
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);


  ngOnInit(): void {
    this.initForms();
    this.getUserData();
  }

  // !init forms
  initForms() {
    //& Profile form
    this.profileForm = this.fb.group({
      first_name: ['', [Validators.required, Validators.minLength(2)]],
      last_name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{11}$')]],
    });

    //!change Password form
    this.passwordForm = this.fb.group(
      {
        old_password: ['', [Validators.required]],
        new_password: ['', [Validators.required, Validators.minLength(8)]],
        confirm_password: ['', [Validators.required]],
      },
      {
        validators: this.passwordMatchValidator,
      }
    );
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('new_password')?.value;
    const confirmPassword = form.get('confirm_password')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  // !get user data
  getUserData() {
    this.isLoading = true;
    this.errorMessage = '';

    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('user_id');

    if (!token ) {
      this.errorMessage = 'Authentication required. Please login again.';
      console.log(this.errorMessage);
      this.isLoading = false;
      return;
    }
    // &api call
    this.authService.getUserData().subscribe({
      next: (res: IProfile) => {
        this.userProfile = res;
        console.log(this.userProfile);
        console.log(res);
        //& Update form with user data
        this.profileForm.patchValue({
          first_name: res.first_name,
          last_name: res.last_name,
          email: res.email,
          phone: res.phone_number,
        });
        this.isLoading = false;
      },
      error: (err: any) => {
        this.userProfile = null;
        this.errorMessage = err.error?.message || 'Failed to load user data';
        this.isLoading = false;
        console.error('Error fetching user data:', err);
        console.error('Error fetching user data:', err);
        console.log('Status:', err.status);
        console.log('Error body:', err.error);
      },
    });
  }


  // !update user data
  onUpdateUser() {
    if (this.profileForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      this.authService.updateUserData(this.profileForm.value).subscribe({ 
        next: (res: ApiResponse) => {
          console.log('User updated successfully:', res);
          this.isLoading = false;
          this.profileForm.reset();
          this.getUserData();
        },
        error: (err: any) => {  
          this.errorMessage = err.error?.message || 'Failed to update user';
          this.isLoading = false;
          console.error('Error updating user:', err);
        },
      });
    }
  }


  // !change password
  onPasswordChange() {
    if (this.passwordForm.valid) {
      this.isPasswordLoading = true;
      this.errorMessage = '';

      this.authService.changePassword(this.passwordForm.value).subscribe({
        next: (res: ApiResponse) => {
          console.log('Password changed successfully:', res);
          this.isPasswordLoading = false;
          this.passwordForm.reset();
        },
        error: (err: any) => {
          this.errorMessage = err.error?.message || 'Failed to change password';
          this.isPasswordLoading = false;
          console.error('Error changing password:', err);
        },
      });
    }
  }

  onDeleteAccount() {
    if (
      confirm(
        'Are you sure you want to delete your account? This action cannot be undone.'
      )
    ) {
      this.isLoading = true;
      this.errorMessage = '';

      this.authService.deleteAccount().subscribe({
        next: () => {
          console.log('Account deleted successfully');
          localStorage.removeItem('token');
          localStorage.removeItem('user_id');
          // Redirect to login or home page
        },
        error: (err: any) => {
          this.errorMessage = err.error?.message || 'Failed to delete account';
          this.isLoading = false;
          console.error('Error deleting account:', err);
        },
      });
    }
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true'
    });
  }
}
