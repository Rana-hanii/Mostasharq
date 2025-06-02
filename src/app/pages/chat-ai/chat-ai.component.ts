import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, inject, NgZone, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IHistory } from '../../core/interfaces/IHistory';
import ChatService from '../../core/services/chat/chat.service';
import { FixflowbiteService } from '../../shared/Services/fixflowbite.service';
import { NavSidebarComponent } from '../../shared/components/nav-sidebar/nav-sidebar.component';

interface ChatMessage {
  type: 'user' | 'ai';
  content: string;
}

declare var VANTA: any;
declare var THREE: any;

@Component({
  selector: 'app-chat-ai',
  standalone: true,
  imports: [NavSidebarComponent, CommonModule, FormsModule],
  templateUrl: './chat-ai.component.html',
  styleUrl: './chat-ai.component.css'
})
export class ChatAiComponent implements OnInit, AfterViewInit, OnDestroy {
  readonly _FixflowbiteService = inject(FixflowbiteService);
  private readonly chatService = inject(ChatService);
  private vantaEffect: any = null;
  private readonly ngZone = inject(NgZone);

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

  ngAfterViewInit(): void {
    this.loadVantaScripts().then(() => {
      this.initializeVanta();
    });
  }

  ngOnDestroy(): void {
    this.destroyVanta();
  }

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

    // Load Three.js first, then Vanta.js
    return loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js')
      .then(() => loadScript('https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.fog.min.js'))
      .then(() => {})
      .catch(error => {
        console.error('Error loading Vanta.js or Three.js scripts:', error);
        throw error; // Re-throw to propagate the error
      });
  }

  private initializeVanta(): void {
    // Wait for VANTA and THREE to be defined
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
}

