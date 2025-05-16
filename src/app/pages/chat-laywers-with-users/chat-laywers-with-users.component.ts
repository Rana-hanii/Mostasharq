import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NavSidebarComponent } from "../../shared/components/nav-sidebar/nav-sidebar.component";

@Component({
  selector: 'app-chat-laywers-with-users',
  imports: [RouterLink, RouterLinkActive, NavSidebarComponent],
  templateUrl: './chat-laywers-with-users.component.html',
  styleUrl: './chat-laywers-with-users.component.css'
})
export class ChatLaywersWithUsersComponent {

}
