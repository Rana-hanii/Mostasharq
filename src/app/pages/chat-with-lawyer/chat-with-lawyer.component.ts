import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NavSidebarComponent } from "../../shared/components/nav-sidebar/nav-sidebar.component";

@Component({
  selector: 'app-chat-with-lawyer',
  imports: [RouterLink, RouterLinkActive, NavSidebarComponent],
  templateUrl: './chat-with-lawyer.component.html',
  styleUrl: './chat-with-lawyer.component.css'
})
export class ChatWithLawyerComponent {

}
