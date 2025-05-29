import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NavSidebarComponent } from '../../shared/components/nav-sidebar/nav-sidebar.component';
import { Ilawyer } from './../../core/interfaces/ILawyer';
import { UserChatsService } from './../../core/services/user/user-chats.service';

@Component({
  selector: 'app-chat-with-lawyer',
  imports: [RouterLink, RouterLinkActive, NavSidebarComponent, FormsModule, CommonModule],
  templateUrl: './chat-with-lawyer.component.html',
  styleUrl: './chat-with-lawyer.component.css',
})
export class ChatWithLawyerComponent implements OnInit {
  showModal = false;
  selectedGovernorate: string = '';
  governorates: string[] = [];
  lawyers: Ilawyer[] = [];

  selectedLawyer: Ilawyer | null = null;
  currentChatId: number | null = null;

  chats: any[] = [];
  isLoadingChats = false;
  chatsError = '';

  messages: any[] = [];
  newMessage: string = '';

  userChatsService = inject(UserChatsService);
  router = inject(Router);

  ngOnInit() {
    this.getGovernorates();
    this.getChats();
  }

  //! get all governorates
  getGovernorates() {
    this.userChatsService.getGovernorates().subscribe({
      next: (res: string[]) => {
        console.log(res);
        this.governorates = res;
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }
  //! get all lawyers in this governorat
  onGovernorateChange() {
    this.userChatsService
      .getLawyers(this.selectedGovernorate)
      .subscribe({
        next: (res: Ilawyer[]) => {
          console.log(res);
          console.log(this.lawyers);
         
          this.lawyers = res;
        },
        error: (err: any) => {
          console.log(err);
        },
      });
  }

  //! modal
  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedGovernorate = '';
    this.lawyers = [];
  }

  //! start chat with lawyer
  startChatWithLawyer(lawyer: Ilawyer) {
    this.userChatsService.chooseLawyer(lawyer.user_id).subscribe({
      next: (res) => {
        console.log(res);
        this.currentChatId = res.chat_id;
        this.selectedLawyer = {
          ...lawyer,
          first_name: res.lawyer_name || lawyer.first_name,
        };
        this.messages = res.messages || [];
        this.closeModal();
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  //! get all chats
  getChats() {
    this.isLoadingChats = true;
    this.chatsError = '';
    this.userChatsService.getChats().subscribe({
      next: (res) => {
        console.log(res);
        this.chats = Array.isArray(res) ? res : (res.chats || []);
        this.isLoadingChats = false;
      },
      error: (err) => {
        this.chats = [];
        this.isLoadingChats = false;
        this.chatsError = 'error in get chats';
      }
    });
  }

  openChat(chat: any) {
    this.currentChatId = chat.chat_id;
    this.selectedLawyer = {
      user_id: chat.participant_id,
      first_name: chat.participant_name || '',
      last_name: '',
      email: '',
      phone_number: '',
      specialization: '',
      governorate: '',
      lawyer_balance: 0
    };
    // جلب كل الرسائل من الشات
    this.userChatsService.getChatFull(chat.chat_id).subscribe({
      next: (res) => {
        this.messages = (res.messages || []).map((msg: any) => ({
          content: msg.content,
          is_user: msg.role === 'user',
          time: msg.timestamp
        }));
      },
      error: (err) => {
        this.messages = [];
      }
    });
  }

  sendMessageFromUI() {
    if (!this.currentChatId || !this.newMessage.trim()) return;
    const msg = this.newMessage.trim();
    this.userChatsService.sendMessage(this.currentChatId, msg).subscribe({
      next: (res) => {
        // بعد إرسال الرسالة، جلب الرسائل من جديد
        this.userChatsService.getChatFull(this.currentChatId!).subscribe({
          next: (fullRes) => {
            this.messages = (fullRes.messages || []).map((msg: any) => ({
              content: msg.content,
              is_user: msg.role === 'user',
              time: msg.timestamp
            }));
          },
          error: () => {
            // fallback: أضف الرسالة محلياً فقط
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
        // يمكنك إضافة إشعار بالخطأ هنا
        console.error(err);
      }
    });
  }
}
