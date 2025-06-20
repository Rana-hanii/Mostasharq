import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { OrderPayload, OrderService } from '../../core/services/company/order.service';
import { NavSidebarComponent } from "../../shared/components/nav-sidebar/nav-sidebar.component";

interface SavedOrderReference {
  order_id: number;
  status: string;
}

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [ NavSidebarComponent, ReactiveFormsModule, CommonModule],
  templateUrl: './order.component.html',
  styleUrl: './order.component.css'
})
export class OrderComponent implements OnInit {
  orderForm: FormGroup;
  ordersList: any[] = []; // To store full details of all fetched orders
  orderFormSubmitted: boolean = false; // To track if the main order form has been submitted

  constructor(private fb: FormBuilder, private orderService: OrderService, private toastr: ToastrService) {
    this.orderForm = this.fb.group({
      description: ['', Validators.required],
      order_type: ['legal_model', Validators.required] // Set initial value to 'legal_model'
    });
  }

  ngOnInit(): void {
    this.loadOrdersReferencesAndFetchStatuses();
  }
  

  private loadOrdersReferencesAndFetchStatuses(): void {
    const storedOrders = localStorage.getItem('savedOrders');
    if (storedOrders) {
      const parsedOrders: SavedOrderReference[] = JSON.parse(storedOrders);
      this.ordersList = []; // Clear existing list before re-populating
      parsedOrders.forEach(orderRef => {
        this.fetchAndAddOrderStatus(orderRef.order_id, orderRef.status);
      });
    }
  }

  private saveOrderReference(orderId: number, status: string): void {
    const storedOrders = localStorage.getItem('savedOrders');
    let orders: SavedOrderReference[] = storedOrders ? JSON.parse(storedOrders) : [];
    // Prevent duplicates if an order with the same ID already exists
    if (!orders.some(o => o.order_id === orderId)) {
      orders.push({ order_id: orderId, status: status });
      localStorage.setItem('savedOrders', JSON.stringify(orders));
    }
  }

  private fetchAndAddOrderStatus(orderId: number, status: string): void {
    console.log(`Attempting to fetch status for Order ID: ${orderId}, Status: ${status}`);
    this.orderService.getOrderStatus(orderId, status).subscribe({
      next: (response) => {
        console.log(`Received status response for Order ID ${orderId}:`, response);
        const statusResponse = Array.isArray(response) && response.length > 0 ? response[0] : response;

        if (!statusResponse || !statusResponse.order_id) {
          console.warn(`Invalid or incomplete status response for Order ID ${orderId}:`, statusResponse);
          this.ordersList.push({ order_id: orderId, status: 'error', errorMessage: 'Incomplete data' });
          return; // Exit if data is not usable
        }

        // Check if order already exists in ordersList to avoid duplicates on refresh/re-fetch
        const existingIndex = this.ordersList.findIndex(o => o.order_id === statusResponse.order_id);
        if (existingIndex > -1) {
          this.ordersList[existingIndex] = statusResponse; // Update existing order
        } else {
          this.ordersList.push(statusResponse); // Add new order
        }
        // Sort orders by order_id for consistent display
        this.ordersList.sort((a, b) => a.order_id - b.order_id);
      },
      error: (statusError) => {
        console.error(`Error fetching order status for Order ID ${orderId}:`, statusError);
        this.ordersList.push({ order_id: orderId, status: 'error', errorMessage: 'Failed to load details' });
        this.toastr.error('Failed to fetch order status.', 'Error');
      }
    });
  }

  submitOrder() {
    this.orderFormSubmitted = true; // Set to true when the form is submitted
    if (this.orderForm.valid) {
      const formValue = this.orderForm.value;

      const payload: OrderPayload = {
        order_type: formValue.order_type, // Use value from form
        description: formValue.description,
        database_schema: {},
        training_data: {}
      };

      this.orderService.Order(payload).subscribe({
        next: (response) => {
          console.log('Order placed successfully:', response);
          this.toastr.success('Order placed successfully!', 'Success');
          this.orderForm.reset();
          this.orderFormSubmitted = false; // Reset after successful submission and reset

          if (response.order_id && response.status) {
            this.saveOrderReference(response.order_id, response.status);
            this.fetchAndAddOrderStatus(response.order_id, response.status);
          } else {
            console.warn('Order ID or Status not found in order creation response.');
          }
        },
        error: (error) => {
          console.error('Error placing order:', error);
          this.toastr.error('Failed to place order. Please try again.', 'Error');
          this.orderFormSubmitted = false; // Reset on error
        }
      });
    } else {
      this.toastr.info('Please fill out all required fields.', 'Info');
      this.orderFormSubmitted = false; // Reset if form is invalid
    }
  }

  clearAllOrders(): void {
    localStorage.removeItem('savedOrders');
    this.ordersList = [];
  }

  getStatusColorClass(status: string | undefined): string {
    switch (status) {
      case 'pending':
        return 'bg-yellow-400';
      case 'completed':
        return 'bg-green-500';
      case 'cancelled':
      case 'error': // Assuming 'error' status should also be red
        return 'bg-red-500';
      default:
        return 'bg-gray-500'; // Default color for unknown or null status
    }
  }
}
