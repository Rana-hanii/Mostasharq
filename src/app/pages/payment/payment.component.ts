import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NavDarkComponent } from "../../shared/components/nav-dark/nav-dark.component";

@Component({
  selector: 'app-payment',
  imports: [RouterLink, RouterLinkActive, NavDarkComponent],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css'
})
export class PaymentComponent {

}
