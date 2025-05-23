import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NavDarkComponent } from "../../shared/components/nav-dark/nav-dark.component";

@Component({
  selector: 'app-order',
  imports: [ NavDarkComponent],
  templateUrl: './order.component.html',
  styleUrl: './order.component.css'
})
export class OrderComponent {

}
