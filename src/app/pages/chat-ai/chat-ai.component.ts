import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, inject, NgZone, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IHistory } from '../../core/interfaces/IHistory';
import ChatService from '../../core/services/chat/chat.service';
import { MarkdownFormatPipe } from '../../pipes/markdown-format.pipe';
import { FixflowbiteService } from '../../shared/Services/fixflowbite.service';
import { NavSidebarComponent } from '../../shared/components/nav-sidebar/nav-sidebar.component';
import { response } from 'express';

interface ChatMessage {
  type: 'user' | 'model';
  content: string;
}

declare var VANTA: any;
declare var THREE: any;

@Component({
  selector: 'app-chat-ai',
  standalone: true,
  imports: [NavSidebarComponent, CommonModule, FormsModule, MarkdownFormatPipe],
  templateUrl: './chat-ai.component.html',
  styleUrl: './chat-ai.component.css'
})
export class ChatAiComponent implements OnInit, AfterViewInit, OnDestroy {
  // Injected Services
  readonly _FixflowbiteService = inject(FixflowbiteService);
  private readonly chatService = inject(ChatService);
  private readonly ngZone = inject(NgZone);

  // State Variables
  chatHistory: IHistory | null = null;
  isLoading = false;
  errorMessage = '';
  message = '';
  currentChatId: string | null = null;
  messages: ChatMessage[] = [];
  isTyping = false;

  // Vanta.js properties
  private vantaEffect: any = null;

  // Lifecycle Hooks
  ngOnInit(): void {
    this.loadChatHistory();
  }

  ngAfterViewInit(): void {
    this.loadVantaScripts().then(() => {
      this.initializeVanta();
    });
  }

  ngOnDestroy(): void {
    this.destroyVanta();
  }

  // Private Helper Methods (Vanta.js related)
  private loadVantaScripts(): Promise<void> {
    const loadScript = (src: string): Promise<void> => {
      return new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve();
        script.onerror = (error) => reject(error);
        document.head.appendChild(script);
      });
    };

    return loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js')
      .then(() => loadScript('https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.fog.min.js'))
      .then(() => {})
      .catch(error => {
        console.error('Error loading Vanta.js or Three.js scripts:', error);
        throw error;
      });
  }

  private initializeVanta(): void {
    if (typeof VANTA === 'undefined' || typeof THREE === 'undefined') {
      setTimeout(() => this.initializeVanta(), 50);
      return;
    }

    try {
      this.ngZone.runOutsideAngular(() => {
        this.vantaEffect = VANTA.FOG({
          el: "#vanta-bg",
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          highlightColor: 0x030712,
          midtoneColor: 0x7f3434,
          lowlightColor: 0x310000,
          baseColor: 0x030712,
          blurFactor: 0.72,
          speed: 3.60,
          zoom: 0.90
        });
      });
    } catch (error) {
      console.error('Error initializing VANTA effect:', error);
    }
  }

  private destroyVanta(): void {
    if (this.vantaEffect) {
      try {
        this.vantaEffect.destroy();
      } catch (error) {
        console.error('Error destroying VANTA effect:', error);
      }
      this.vantaEffect = null;
    }
  }

  // Public Methods (Chat functionality)
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
        this.errorMessage = error.error?.detail || 'Failed to load chat history';
        this.isLoading = false;
        console.error('Error loading chat history:', error);
      }
    });
  }

  startNewChat(): void {
    if (this.isLoading) return;
    
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
        this.errorMessage = error.error?.detail || 'Failed to start new chat';
        this.isLoading = false;
        console.error('Error starting new chat:', error);
        console.log(error)
      }
    });
  }

  sendMessage(): void {
    if (this.message.trim() && this.currentChatId) {
      this.messages.push({
        type: 'user',
        content: this.message
      });

      const messageToSend = this.message;
      this.message = '';
      this.isTyping = true;

      this.chatService.sendMessage(messageToSend, this.currentChatId).subscribe({
        next: (response) => {
          this.messages.push({
            type: 'model',
            content: response.response
          });
          this.isTyping = false;
        },
        error: (error) => {
          this.isTyping = false;
        }
      });
    }
  }

  getChatDetails(chatId: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.chatService.getChat(chatId).subscribe({
      next: (chat) => {
        this.currentChatId = chatId.toString();
        console.error('ID',this.currentChatId);
        this.isLoading = false;
        this.messages = (chat.messages || []).map((msg: any) => ({
          type: msg.role === 'user' ? 'user' : 'model',
          content: (msg.content || msg.text || msg.message || msg.response)
        }));
        console.log('Model message:', chat.messages);
        console.log('Chat details loaded:', chat);
      },
      error: (error) => {
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

