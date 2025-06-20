import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, inject, NgZone, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NavSidebarComponent } from '../../shared/components/nav-sidebar/nav-sidebar.component';
import { Ilawyer } from './../../core/interfaces/ILawyer';
import { UserChatsService } from './../../core/services/user/user-chats.service';

declare var VANTA: any;
declare var THREE: any;

@Component({
  selector: 'app-chat-with-lawyer',
  imports: [RouterLink, RouterLinkActive, NavSidebarComponent, FormsModule, CommonModule],
  templateUrl: './chat-with-lawyer.component.html',
  styleUrl: './chat-with-lawyer.component.css',
})
export class ChatWithLawyerComponent implements OnInit, AfterViewInit, OnDestroy {
  private vantaEffect: any = null;
  private readonly ngZone = inject(NgZone);
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

  isTyping: boolean = false;

  ngOnInit() {
    this.getGovernorates();
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
        this.userChatsService.getChatFull(this.currentChatId!).subscribe({
          next: (fullRes) => {
            this.messages = (fullRes.messages || []).map((msg: any) => ({
              content: msg.content,
              is_user: msg.role === 'user',
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

  endCurrentChat() {
    this.currentChatId = null;
    this.selectedLawyer = null;
    this.messages = [];
  }
  
  getContactUsRoute(): string {
    const userType = localStorage.getItem('user_type');
    if (userType === 'company') {
      return '/company/contact-us';
    }
    return '/client/contact-us';
  }

}
