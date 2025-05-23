import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IHistory } from '../../core/interfaces/IHistory';
import ChatService from '../../core/services/chat/chat.service';
import { FixflowbiteService } from '../../shared/Services/fixflowbite.service';
import { NavSidebarComponent } from '../../shared/components/nav-sidebar/nav-sidebar.component';

interface ChatMessage {
  type: 'user' | 'ai';
  content: string;
}

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
  currentChatId: string | null = null;
  messages: ChatMessage[] = [];
  isTyping = false;

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
    if (this.isLoading) return; // Prevent multiple simultaneous requests
    
    this.isLoading = true;
    this.errorMessage = '';

    this.chatService.startChat().subscribe({
      next: (response) => {
        this.currentChatId = response.chat_id.toString();
        this.isLoading = false;
        this.messages = []; // Clear messages for new chat
        console.log('New chat started:', response);
        this.loadChatHistory();
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to start new chat';
        this.isLoading = false;
        console.error('Error starting new chat:', error);
        alert(this.errorMessage); // Show error to user
      }
    });
  }

  //! send message
  sendMessage(): void {
    if (this.message.trim() && this.currentChatId) {
      // Add user message to chat
      this.messages.push({
        type: 'user',
        content: this.message
      });

      const messageToSend = this.message;
      this.message = ''; // Clear input
      this.isTyping = true;

      this.chatService.sendMessage(messageToSend).subscribe({
        next: (response) => {
          console.log('Sending to chat_id:', this.currentChatId);
          console.log('AI response:', response);
          console.log('AI response:', response.response);
          // Add AI response to chat
          this.messages.push({
            type: 'ai',
            content: response.response
          });
          this.isTyping = false;
        },
        error: (error) => {
          console.log('Sending to chat_id:', this.currentChatId);
          console.error('Error sending message:', error);
          this.isTyping = false;
        }
      });
    }
  }

  //! get chat details
  getChatDetails(chatId: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.chatService.getChat(chatId).subscribe({
      
      next: (chat) => {
        console.log('Sending to chat_id:', this.currentChatId);
        this.currentChatId = chatId.toString();
        this.isLoading = false;
        console.log('Chat details loaded:', chat);
      },
      error: (error) => {
        console.log('Sending to chat_id:', this.currentChatId);
        this.errorMessage = error.error?.message || 'Failed to load chat details';
        this.isLoading = false;
        console.error('Error loading chat details:', error);
      }
    });
  }

  endCurrentChat(): void {
    if (!this.currentChatId || this.isLoading) return;
    
    this.isLoading = true;
    this.errorMessage = '';
    
    this.chatService.endChat(Number(this.currentChatId)).subscribe({
      next: (res) => {
        this.isLoading = false;
        console.log('Chat ended successfully');
        this.loadChatHistory();
        this.currentChatId = null;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to end chat';
        this.isLoading = false;
        console.error('Error ending chat:', err);
        alert(this.errorMessage);
      }
    });
  }
}
