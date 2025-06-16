import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, inject, NgZone, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IHistory } from '../../core/interfaces/IHistory';
import { ContactUsService } from '../../core/services/contact-us/contact-us.service';
import { MarkdownFormatPipe } from '../../pipes/markdown-format.pipe';
import { NavSidebarComponent } from "../../shared/components/nav-sidebar/nav-sidebar.component";

interface ChatMessage {
  type: 'user' | 'model';
  content: string;
}

declare var VANTA: any;
declare var THREE: any;

@Component({
  selector: 'app-contact-us',
  imports: [NavSidebarComponent, CommonModule, FormsModule, MarkdownFormatPipe],
  templateUrl: './contact-us.component.html',
  styleUrl: './contact-us.component.css'
})
export class ContactUsComponent implements AfterViewInit, OnDestroy, OnInit {
  private vantaEffect: any = null;
  private readonly ngZone = inject(NgZone);
  private readonly contactUsService = inject(ContactUsService);

  // State Variables
  chatHistory: IHistory | null = null;
  isLoading = false;
  errorMessage = '';
  message = '';
  currentChatId: number | null = null;
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

    this.contactUsService.getHistory().subscribe({
      next: (history: IHistory) => {
        this.chatHistory = history;
        this.isLoading = false;
        console.log('Chat history loaded:', history);
      },
      error: (error: any) => {
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

    this.contactUsService.startChat().subscribe({
      next: (response: any) => {
        this.currentChatId = response.chat_id;
        this.isLoading = false;
        this.messages = []; // Clear messages for new chat
        console.log('New chat started:', response);
        this.loadChatHistory(); // Reload history after new chat
      },
      error: (error: any) => {
        this.errorMessage = error.error?.detail || 'Failed to start new chat';
        this.isLoading = false;
        console.error('Error starting new chat:', error);
      }
    });
  }

  sendMessage(): void {
    if (this.message.trim() === '' || !this.currentChatId) {
      this.errorMessage = 'Please enter a message or wait for the session to start.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.contactUsService.sendMessage(this.currentChatId, this.message).subscribe({
      next: (response: any) => {
        console.log('Message sent successfully:', response);
        this.message = ''; // Clear message input
        this.isLoading = false;
        this.getChatDetails(this.currentChatId!); // Refresh chat details after sending message
      },
      error: (error: any) => {
        this.errorMessage = error.error?.detail || 'Failed to send message.';
        this.isLoading = false;
        console.error('Error sending message:', error);
      }
    });
  }

  getChatDetails(chatId: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.contactUsService.getChat(chatId).subscribe({ // Assuming getChat API exists and works
      next: (chat: any) => {
        this.currentChatId = chatId;
        console.log('Chat details loaded for ID:', this.currentChatId);
        this.isLoading = false;
        this.messages = (chat.messages || []).map((msg: any) => ({
          type: msg.role === 'user' ? 'user' : 'model',
          content: (msg.content || msg.text || msg.message || msg.response)
        }));
      },
      error: (error: any) => {
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
    
    this.contactUsService.endChat(this.currentChatId).subscribe({ // Assuming endChat API exists and works
      next: (res: any) => {
        this.isLoading = false;
        console.log('Chat ended successfully');
        this.loadChatHistory(); // Reload history after ending chat
        this.currentChatId = null;
        this.messages = []; // Clear current chat messages
      },
      error: (err: any) => {
        this.errorMessage = err.error?.message || 'Failed to end chat';
        this.isLoading = false;
        console.error('Error ending chat:', err);
        alert(this.errorMessage);
      }
    });
  }
}
