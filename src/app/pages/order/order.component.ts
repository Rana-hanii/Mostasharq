import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NavDarkComponent } from "../../shared/components/nav-dark/nav-dark.component";
import { NavSidebarComponent } from "../../shared/components/nav-sidebar/nav-sidebar.component";

@Component({
  selector: 'app-order',
  imports: [ NavSidebarComponent],
  templateUrl: './order.component.html',
  styleUrl: './order.component.css'
})
export class OrderComponent {

}
