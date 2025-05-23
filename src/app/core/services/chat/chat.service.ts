import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { WEBSITE_BASE_URL } from '../../constance/WEBSITE_BASE_URL';
import { IHistory } from '../../interfaces/IHistory';

interface IStartChat {
  chat_id: number;
  status: string;
  started_at: string;
  ended_at: string | null;
}

interface IChatResponse {
  response: string;
  chat_id: string;
}

@Injectable({
  providedIn: 'root'
})
export default class ChatService {
  private currentChatId: number | null = null;
  private readonly http = inject(HttpClient);

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true'
    });
  }

  //! create chat >> new chat (chats)
  startChat(): Observable<IStartChat> {
    return this.http.post<IStartChat>(
      `${WEBSITE_BASE_URL}chats`,
      {},
      { headers: this.getHeaders() }
    ).pipe(
      tap(response => {
        this.currentChatId = response.chat_id;
        localStorage.setItem('current_chat_id', response.chat_id.toString());
        console.log('New chat started with ID:', this.currentChatId);
      })
    );
  }

  //! get current chat ID
  getCurrentChatId(): number | null {
    if (!this.currentChatId) {
      const storedId = localStorage.getItem('current_chat_id');
      if (storedId) {
        this.currentChatId = parseInt(storedId);
      }
    }
    return this.currentChatId;
  }

 
  //! get this chat 
  getChat(chatId: number): Observable<IStartChat> {
    return this.http.get<IStartChat>(
      `${WEBSITE_BASE_URL}chats/${chatId}`,
      { headers: this.getHeaders() }
    );
  }

  //! get history >> all history with it's title , array , api >> chat history
  getHistory(limit: number = 20, offset: number = 0): Observable<IHistory> {
    return this.http.get<IHistory>(
      `${WEBSITE_BASE_URL}users/me/chat-history`,
      { 
        headers: this.getHeaders(),
        params: {
          limit: limit.toString(),
          offset: offset.toString()
        }
      }
    );
  }

  //! End chat
  endChat(chatId: number): Observable<IStartChat> {
    return this.http.put<IStartChat>(
      `${WEBSITE_BASE_URL}chats/${chatId}/end`,
      {},
      { headers: this.getHeaders() }
    );
  }

  //! AI chat 
  sendMessage(message: string): Observable<IChatResponse> {
    const body = {
      message,
      chat_id: this.currentChatId ? this.currentChatId.toString() : '',
      temperature: 0.7,
      max_tokens: 8192
    };
    
    return this.http.post<IChatResponse>(
      `${WEBSITE_BASE_URL}chatttt`,
      body,
      { headers: this.getHeaders() }
    );
  }


}

