import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SubscriptionService } from '../../core/services/subscription/subscription.service';
import { NavSidebarComponent } from "../../shared/components/nav-sidebar/nav-sidebar.component";

@Component({
  selector: 'app-payment',
  imports: [ CommonModule, ReactiveFormsModule, NavSidebarComponent, RouterModule],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css'
})
export class PaymentComponent implements OnInit {
  paymentForm!: FormGroup;
  errorMessage = '';
  isLoading = false;
  messageQuota: any = null;
  isQuotaLoading = false;
  quotaError = '';
  userSubscription: any = null;
  isSubscriptionLoading = false;
  subscriptionError = '';
  usedMessages = 0;
  progressPercent = 0;
  remainingDays = 0;

  private readonly fb = inject(FormBuilder);
  private readonly subscriptionService = inject(SubscriptionService);

  ngOnInit(): void {
    this.paymentForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{11}$')]],
      plan: [null, [Validators.required]]
    });
    this.fetchMessageQuota();
    this.fetchUserSubscription();
  }

  get f() { return this.paymentForm.controls; }

  onCheckout() {
    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      this.errorMessage = 'Please fill all fields correctly.';
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';
    const userId = Number(localStorage.getItem('user_id'));
    const plan = this.paymentForm.value.plan;
    this.subscriptionService.initiatePayment(plan, userId).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.payment_url) {
          window.open(res.payment_url, '_blank');
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Payment initiation failed.';
      }
    });
  }

  fetchMessageQuota() {
    this.isQuotaLoading = true;
    this.quotaError = '';
    this.subscriptionService.getMessageQuota().subscribe({
      next: (data) => {
        this.messageQuota = data;
        // Calculate used messages and progress
        if (data && typeof data.total_messages === 'number' && typeof data.remaining_messages === 'number') {
          this.usedMessages = data.total_messages - data.remaining_messages;
          this.progressPercent = data.total_messages > 0 ? Math.round((this.usedMessages / data.total_messages) * 100) : 0;
        }
        // Calculate remaining days
        if (data && data.expiry_date) {
          const expiry = new Date(data.expiry_date);
          const now = new Date();
          const diff = expiry.getTime() - now.getTime();
          this.remainingDays = Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
        }
        this.isQuotaLoading = false;
      },
      error: (err) => {
        this.quotaError = 'Failed to load message quota.';
        this.isQuotaLoading = false;
      }
    });
  }

  fetchUserSubscription() {
    this.isSubscriptionLoading = true;
    this.subscriptionError = '';
    this.subscriptionService.getUserSubscription().subscribe({
      next: (data) => {
        // If the API returns an array, get the first active subscription
        if (Array.isArray(data)) {
          this.userSubscription = data.find((sub: any) => sub.status === 'active') || data[0] || null;
        } else {
          this.userSubscription = data;
        }
        this.isSubscriptionLoading = false;
      },
      error: (err) => {
        this.subscriptionError = 'Failed to load subscription.';
        this.isSubscriptionLoading = false;
      }
    });
  }

  getContactUsRoute(): string {
    const userType = localStorage.getItem('user_type');
    if (userType === 'company') {
      return '/company/contact-us';
    }
    return '/client/contact-us';
  }
}
