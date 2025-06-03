import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, NgZone, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UserChatsService } from '../../core/services/user/user-chats.service';
import { NavSidebarComponent } from "../../shared/components/nav-sidebar/nav-sidebar.component";
import { LawyerService } from './../../core/services/lawyer/lawyer.service';

declare var VANTA: any;
declare var THREE: any;

@Component({
  selector: 'app-chat-laywers-with-users',
  imports: [RouterLink, RouterLinkActive, NavSidebarComponent, CommonModule, FormsModule],
  templateUrl: './chat-laywers-with-users.component.html',
  styleUrl: './chat-laywers-with-users.component.css'
})
export class ChatLaywersWithUsersComponent implements OnInit, AfterViewInit, OnDestroy {
  private vantaEffect: any = null;
  private readonly ngZone = inject(NgZone);
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
