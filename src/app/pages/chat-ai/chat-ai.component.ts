import { Component, inject } from '@angular/core';

import { FixflowbiteService } from '../../shared/Services/fixflowbite.service';
import { NavSidebarComponent } from '../../shared/components/nav-sidebar/nav-sidebar.component';

@Component({
  selector: 'app-chat-ai',
  imports: [NavSidebarComponent],
  templateUrl: './chat-ai.component.html',
  styleUrl: './chat-ai.component.css'
})
export class ChatAiComponent {
  readonly _FixflowbiteService = inject(FixflowbiteService)

}
