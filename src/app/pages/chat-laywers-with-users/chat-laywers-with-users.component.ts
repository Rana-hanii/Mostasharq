import { LawyerService } from './../../core/services/lawyer/lawyer.service';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UserChatsService } from '../../core/services/user/user-chats.service';
import { NavSidebarComponent } from "../../shared/components/nav-sidebar/nav-sidebar.component";

@Component({
  selector: 'app-chat-laywers-with-users',
  imports: [RouterLink, RouterLinkActive, NavSidebarComponent, CommonModule, FormsModule],
  templateUrl: './chat-laywers-with-users.component.html',
  styleUrl: './chat-laywers-with-users.component.css'
})
export class ChatLaywersWithUsersComponent implements OnInit {
  chats: any[] = [];
  selectedUser: any = null;
  currentChatId: number | null = null;
  messages: any[] = [];
  newMessage: string = '';
  isLoadingChats = false;
  chatsError = '';

  lawyerService = inject(LawyerService);
  userChatsService = inject(UserChatsService);
  ngOnInit() {
    this.getChats();
  }

  getChats() {
    this.isLoadingChats = true;
    this.chatsError = '';
    this.lawyerService.getChats().subscribe({
      next: (res: any) => {
        console.log(res);
        this.chats = Array.isArray(res) ? res : (res.chats || []);
        this.isLoadingChats = false;
      },
      error: (err: any) => {
        this.chats = [];
        this.isLoadingChats = false;
        this.chatsError = 'error in get chats';
      }
    });
  }

  openChat(chat: any) {
    this.currentChatId = chat.chat_id;
    this.selectedUser = {
      user_id: chat.participant_id,
      first_name: chat.participant_name || '',
    };
    this.userChatsService.getChatFull(chat.chat_id).subscribe({
      next: (res) => {
        this.messages = (res.messages || []).map((msg: any) => ({
          content: msg.content,
          is_user: msg.role === 'lawyer', // المحامي هو الذي يرد هنا
          time: msg.timestamp
        }));
      },
      error: () => {
        this.messages = [];
      }
    });
  }

  sendMessageFromUI() {
    if (!this.currentChatId || !this.newMessage.trim()) return;
    const msg = this.newMessage.trim();
    this.lawyerService.sendMessage(this.currentChatId, msg).subscribe({
      next: () => {
        this.userChatsService.getChatFull(this.currentChatId!).subscribe({
          next: (fullRes) => {
            this.messages = (fullRes.messages || []).map((msg: any) => ({
              content: msg.content,
              is_user: msg.role === 'lawyer',
              time: msg.timestamp
            }));
          },
          error: () => {
            this.messages.push({
              content: msg,
              is_user: true,
              time: new Date().toISOString()
            });
          }
        });
        this.newMessage = '';
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
}
