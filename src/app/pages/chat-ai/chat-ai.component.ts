import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FixflowbiteService } from '../../shared/Services/fixflowbite.service';

@Component({
  selector: 'app-chat-ai',
  imports: [RouterLink,RouterLinkActive],
  templateUrl: './chat-ai.component.html',
  styleUrl: './chat-ai.component.css'
})
export class ChatAiComponent {
  readonly _FixflowbiteService = inject(FixflowbiteService)

}
