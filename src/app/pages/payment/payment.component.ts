import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SubscriptionService } from '../../core/services/subscription/subscription.service';
import { NavDarkComponent } from "../../shared/components/nav-dark/nav-dark.component";

@Component({
  selector: 'app-payment',
  imports: [ NavDarkComponent, ReactiveFormsModule ],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css'
})
export class PaymentComponent implements OnInit {
  paymentForm!: FormGroup;
  errorMessage = '';
  isLoading = false;

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
}
