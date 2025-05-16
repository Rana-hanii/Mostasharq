import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IHistory } from '../../core/interfaces/IHistory';
import ChatService from '../../core/services/chat/chat.service';
import { FixflowbiteService } from '../../shared/Services/fixflowbite.service';
import { NavSidebarComponent } from '../../shared/components/nav-sidebar/nav-sidebar.component';

@Component({
  selector: 'app-chat-ai',
  standalone: true,
  imports: [NavSidebarComponent, CommonModule, FormsModule],
  templateUrl: './chat-ai.component.html',
  styleUrl: './chat-ai.component.css'
})
export class ChatAiComponent implements OnInit {
  readonly _FixflowbiteService = inject(FixflowbiteService);
  private readonly chatService = inject(ChatService);

  //! variables
  chatHistory: IHistory | null = null;
  isLoading = false;
  errorMessage = '';
  message = '';
  currentChatId: number | null = null;

  ngOnInit(): void {
    this.loadChatHistory();
  }

  //! load chat history
  loadChatHistory(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.chatService.getHistory().subscribe({
      next: (history) => {
        this.chatHistory = history;
        this.isLoading = false;
        console.log('Chat history loaded:', history);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to load chat history';
        this.isLoading = false;
        console.error('Error loading chat history:', error);
      }
    });
  }

  //! start new chat
  startNewChat(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.chatService.startChat().subscribe({
      next: (response) => {
        this.currentChatId = response.chat_id;
        this.isLoading = false;
        console.log('New chat started:', response);
        // يمكنك إضافة إعادة تحميل التاريخ هنا إذا كنت تريد
        this.loadChatHistory();
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to start new chat';
        this.isLoading = false;
        console.error('Error starting new chat:', error);
      }
    });
  }

  //! send message
  sendMessage(): void {
    if (!this.message.trim() || !this.currentChatId) return;

    this.isLoading = true;
    this.errorMessage = '';

    // هنا يمكنك إضافة دالة إرسال الرسالة في الـ ChatService
    // this.chatService.sendMessage(this.currentChatId, this.message).subscribe({
    //   next: (response) => {
    //     this.message = '';
    //     this.isLoading = false;
    //     console.log('Message sent:', response);
    //   },
    //   error: (error) => {
    //     this.errorMessage = error.error?.message || 'Failed to send message';
    //     this.isLoading = false;
    //     console.error('Error sending message:', error);
    //   }
    // });
  }

  //! get chat details
  getChatDetails(chatId: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.chatService.getChat(chatId).subscribe({
      next: (chat) => {
        this.currentChatId = chatId;
        this.isLoading = false;
        console.log('Chat details loaded:', chat);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to load chat details';
        this.isLoading = false;
        console.error('Error loading chat details:', error);
      }
    });
  }
}
