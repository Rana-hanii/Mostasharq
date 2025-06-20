import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { LawyerService } from '../../core/services/lawyer/lawyer.service';
import { NavSidebarComponent } from '../../shared/components/nav-sidebar/nav-sidebar.component';

interface Transaction {
  created_at: Date;
  phone_number: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
}

@Component({
  selector: 'app-balance',
  templateUrl: './balance.component.html',
  styleUrls: ['./balance.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavSidebarComponent],
})
export class BalanceComponent implements OnInit {
  balance: number = 0;
  transactions: Transaction[] = [];
  showWithdrawModal: boolean = false;
  isLoading: boolean = false;
  withdrawForm: FormGroup;

  constructor(private fb: FormBuilder, private lawyerService: LawyerService, private toastr: ToastrService) {
    this.withdrawForm = this.fb.group({
      phone: [
        '',
        [Validators.required, Validators.pattern('^01[0125][0-9]{8}$')],
      ],
      amount: [
        '',
        [Validators.required, Validators.min(1), Validators.max(this.balance)],
      ],
    });
  }

  ngOnInit() {
    this.loadBalance();
    this.loadTransactions();
  }

  get f() {
    return this.withdrawForm.controls;
  }

  // ! get Lawyer balance
  loadBalance() {
    this.lawyerService.getBalance().subscribe({
      next: (response: number) => {
        this.balance = response;
        // Update max validator for amount
        this.withdrawForm
          .get('amount')
          ?.setValidators([
            Validators.required,
            Validators.min(1),
            Validators.max(this.balance),
          ]);
      },
      error: (error) => {
        this.toastr.error('Failed to load balance.', 'Error');
        console.error('Error loading balance:', error);
      },
    });
  }

  // ! Get Paid History
  loadTransactions() {
    this.lawyerService.getPaidHistory().subscribe({
      next: (response) => {
        this.transactions = response;
      },
      error: (error) => {
        this.toastr.error('Failed to load transactions.', 'Error');
        console.error('Error loading transactions:', error);
      },
    });
  }

  // ? Modal
  openWithdrawModal() {
    this.showWithdrawModal = true;
  }

  closeWithdrawModal() {
    this.showWithdrawModal = false;
    this.withdrawForm.reset();
  }

  // ! get paid
  onWithdraw() {
    if (this.withdrawForm.valid) {
      this.isLoading = true;
      const { phone, amount } = this.withdrawForm.value;

      this.lawyerService.getPaid(phone, amount).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.closeWithdrawModal();
          this.loadBalance();
          this.loadTransactions();
          this.toastr.success('Withdrawal request submitted successfully!', 'Success');
        },
        error: (error) => {
          this.isLoading = false;
          this.toastr.error('Failed to process withdrawal.', 'Error');
          console.error('Error processing withdrawal:', error);
        },
      });
    } else {
      this.toastr.info('Please fill out all required fields correctly.', 'Info');
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'completed':
        return 'text-green-500';
      case 'pending':
        return 'text-yellow-500';
      case 'failed':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  }
}
