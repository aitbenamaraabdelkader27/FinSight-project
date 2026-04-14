import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth/auth.service';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Conversation {
  id: number;
  user_id: number;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: string;
}

interface ConversationResponse {
  conversation: Conversation;
  messages: Array<{ message: string; response: string; role: string; created_at: string }>;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  template: `
    <div class="chat-page">
      <header class="chat-header">
        <a class="brand" routerLink="/" aria-label="Back to FinSight landing page">
          <span class="brand-mark">FS</span>
          <span class="brand-text">FinSight</span>
        </a>

        <div class="header-actions">
          <span class="user-label" *ngIf="currentUser">{{ currentUser }}</span>
          <button class="logout-button" type="button" (click)="logout()">Logout</button>
          <a class="header-link" routerLink="/">Back to landing</a>
        </div>
      </header>

      <main class="chat-layout">
        <section class="chat-sidebar">
          <p class="sidebar-kicker">Workspace</p>
          <h1>Chat Interface</h1>
          <p class="sidebar-text">
            Your AI-powered financial assistant. Ask questions about IFRS, GAAP,
            tax regulations, or request calculations.
          </p>

          <button class="new-chat-btn" (click)="createConversation()">
            + New Chat
          </button>

          <div class="conversations-section">
            <p class="conversations-title">Conversations</p>
            <div class="conversations-list">
              <div 
                *ngFor="let conv of conversations"
                class="conversation-item"
                [class.active]="conv.id === currentConversationId"
                (click)="selectConversation(conv.id)"
              >
                <span class="conv-title">{{ conv.title }}</span>
                <button 
                  class="delete-btn" 
                  (click)="confirmDelete(conv.id); $event.stopPropagation()"
                  title="Delete conversation"
                >🗑</button>
              </div>
            </div>
          </div>

          <div class="sidebar-card">
            <p class="sidebar-card-title">Quick Commands</p>
            <div class="command-list">
              <span>/help</span>
              <span>/calculate</span>
              <span>/compliance</span>
              <span>/tax</span>
            </div>
          </div>

          <div class="sidebar-card">
            <p class="sidebar-card-title">Status</p>
            <span class="status-pill" [class.connected]="connected">
              {{ connected ? 'Connected' : 'Disconnected' }}
            </span>
          </div>
        </section>

        <section class="chat-shell" aria-label="Chat preview">
          <div class="chat-shell-header">
            <div>
              <p class="chat-shell-kicker">Session</p>
              <h2>{{ currentConversationTitle }}</h2>
            </div>

            <span class="status-pill" [class.connected]="connected">
              {{ connected ? 'AI Mode' : 'Local mode' }}
            </span>
          </div>

          <div class="chat-thread">
            <article class="message assistant" *ngIf="messages.length === 0">
              <p class="message-role">FinSight</p>
              <p class="message-text">
                Hello! I'm FinSight, your AI assistant for KPMG Financial Officers.
                I can help with financial calculations, compliance questions, tax
                regulations, and more. How can I assist you today?
              </p>
            </article>

            <article 
              class="message" 
              *ngFor="let msg of messages"
              [class.assistant]="msg.role === 'assistant'"
              [class.user]="msg.role === 'user'"
            >
              <p class="message-role">{{ msg.role === 'user' ? 'You' : 'FinSight' }}</p>
              <p class="message-text">{{ msg.content }}</p>
            </article>

            <article class="message assistant" *ngIf="loading">
              <p class="message-role">FinSight</p>
              <p class="message-text typing">
                <span class="dot"></span>
                <span class="dot"></span>
                <span class="dot"></span>
              </p>
            </article>
          </div>

          <div class="composer-card">
            <label class="composer-label" for="chat-message">Message</label>
            <textarea
              id="chat-message"
              class="composer-input"
              placeholder="Type a financial request or command..."
              [(ngModel)]="userMessage"
              (keydown.enter)="sendMessage($event)"
              [disabled]="loading"
            ></textarea>

            <div class="composer-actions">
              <span class="composer-note">Press Enter to send</span>
              
              <button 
                class="send-button" 
                type="button" 
                (click)="sendMessage()"
                [disabled]="loading || !userMessage.trim()"
              >
                {{ loading ? 'Sending...' : 'Send' }}
              </button>
            </div>
          </div>
        </section>
      </main>

      <div class="confirm-overlay" *ngIf="showDeleteConfirm">
        <div class="confirm-dialog">
          <p>Delete this conversation?</p>
          <div class="confirm-actions">
            <button class="cancel-btn" (click)="showDeleteConfirm = false">Cancel</button>
            <button class="delete-confirm-btn" (click)="deleteConversation()">Delete</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      min-height: 100vh;
      color: var(--text-primary);
    }

    .chat-page {
      width: min(1240px, calc(100% - 40px));
      margin: 0 auto;
      padding: 24px 0 40px;
    }

    .chat-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      padding: 16px 20px;
      margin-bottom: 28px;
      border-radius: 22px;
      background: rgba(44, 102, 176, 0.42);
      border: 1px solid rgba(157, 201, 255, 0.24);
      backdrop-filter: blur(18px);
    }

    .brand {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      color: inherit;
      text-decoration: none;
      font-weight: 700;
      letter-spacing: 0.04em;
    }

    .brand-mark {
      width: 42px;
      height: 42px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 14px;
      background: linear-gradient(135deg, #d8f3ff, #7fc7ff);
      color: #072039;
      box-shadow: 0 10px 30px rgba(91, 188, 255, 0.18);
    }

    .header-link {
      color: var(--text-secondary);
      text-decoration: none;
      font-weight: 600;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 14px;
      flex-wrap: wrap;
    }

    .user-label {
      color: var(--text-muted);
      font-size: 0.92rem;
    }

    .logout-button {
      border: 1px solid rgba(173, 195, 220, 0.24);
      border-radius: 999px;
      padding: 9px 14px;
      color: var(--text-primary);
      background: rgba(10, 23, 43, 0.5);
      cursor: pointer;
      font-weight: 700;
    }

    .chat-layout {
      display: grid;
      grid-template-columns: minmax(280px, 360px) minmax(0, 1fr);
      gap: 24px;
      align-items: start;
    }

    .chat-sidebar,
    .chat-shell {
      background: rgba(8, 18, 34, 0.64);
      border: 1px solid rgba(143, 169, 200, 0.14);
      border-radius: 28px;
      box-shadow: var(--panel-shadow);
    }

    .chat-sidebar {
      padding: 28px;
      position: sticky;
      top: 20px;
    }

    .sidebar-kicker,
    .chat-shell-kicker {
      text-transform: uppercase;
      letter-spacing: 0.16em;
      font-size: 0.76rem;
      color: var(--accent-soft);
      margin: 0 0 12px;
    }

    h1,
    h2,
    p {
      margin: 0;
    }

    h1 {
      font-size: clamp(2rem, 4vw, 3.3rem);
      line-height: 0.98;
      letter-spacing: -0.04em;
      margin-bottom: 16px;
    }

    h2 {
      font-size: 1.5rem;
    }

    .sidebar-text {
      color: var(--text-secondary);
      line-height: 1.7;
      margin-bottom: 22px;
    }

    .new-chat-btn {
      width: 100%;
      padding: 14px 16px;
      background: #238636;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.95rem;
      margin-bottom: 20px;
      transition: background 0.2s;
    }

    .new-chat-btn:hover {
      background: #2ea043;
    }

    .conversations-section {
      margin-bottom: 20px;
    }

    .conversations-title {
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: var(--text-muted);
      margin-bottom: 10px;
    }

    .conversations-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
      max-height: 200px;
      overflow-y: auto;
    }

    .conversation-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 12px;
      border-radius: 8px;
      cursor: pointer;
      background: rgba(255, 255, 255, 0.03);
      transition: background 0.2s;
    }

    .conversation-item:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .conversation-item.active {
      background: rgba(56, 139, 253, 0.4);
    }

    .conv-title {
      font-size: 0.9rem;
      color: var(--text-secondary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1;
    }

    .conversation-item.active .conv-title {
      color: var(--text-primary);
    }

    .delete-btn {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 0.9rem;
      opacity: 0;
      transition: opacity 0.2s;
      padding: 4px;
    }

    .conversation-item:hover .delete-btn {
      opacity: 0.7;
    }

    .delete-btn:hover {
      opacity: 1;
    }

    .sidebar-card {
      padding: 18px;
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .sidebar-card + .sidebar-card {
      margin-top: 14px;
    }

    .sidebar-card-title {
      font-weight: 700;
      margin-bottom: 12px;
    }

    .sidebar-card ul {
      padding-left: 18px;
      color: var(--text-secondary);
      line-height: 1.7;
      margin: 0;
    }

    .command-list {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }

    .command-list span,
    .status-pill {
      display: inline-flex;
      align-items: center;
      padding: 8px 12px;
      border-radius: 999px;
      background: rgba(125, 196, 255, 0.1);
      border: 1px solid rgba(125, 196, 255, 0.18);
      color: #d7eeff;
      font-size: 0.9rem;
    }

    .chat-shell {
      padding: 24px;
    }

    .chat-shell-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 18px;
      margin-bottom: 20px;
    }

    .chat-thread {
      display: grid;
      gap: 14px;
      min-height: 420px;
      padding: 16px;
      border-radius: 24px;
      background: rgba(5, 12, 23, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.06);
      margin-bottom: 18px;
    }

    .message {
      max-width: 82%;
      padding: 16px 18px;
      border-radius: 20px;
    }

    .message.assistant {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
      justify-self: start;
    }

    .message.user {
      background: rgba(125, 196, 255, 0.12);
      border: 1px solid rgba(125, 196, 255, 0.18);
      justify-self: end;
    }

    .message-role {
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      color: var(--text-muted);
      margin-bottom: 10px;
    }

    .message-text {
      color: var(--text-secondary);
      line-height: 1.65;
    }

    .message-text + .message-text {
      margin-top: 10px;
    }

    .composer-card {
      padding: 18px;
      border-radius: 24px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .composer-label {
      display: inline-block;
      margin-bottom: 10px;
      font-size: 0.9rem;
      color: var(--text-secondary);
    }

    .composer-input {
      width: 100%;
      min-height: 120px;
      resize: vertical;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 18px;
      background: rgba(5, 12, 23, 0.8);
      color: var(--text-primary);
      padding: 16px;
      font: inherit;
      outline: none;
    }

    .composer-input::placeholder {
      color: var(--text-muted);
    }

    .composer-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-top: 14px;
    }

    .composer-note {
      color: var(--text-muted);
      font-size: 0.92rem;
    }

    .send-button {
      border: 0;
      border-radius: 999px;
      padding: 12px 20px;
      background: linear-gradient(135deg, #d8f3ff, #79c5ff);
      color: #09213a;
      font-weight: 700;
      cursor: pointer;
    }

    @media (max-width: 980px) {
      .chat-layout {
        grid-template-columns: 1fr;
      }

      .chat-sidebar {
        position: static;
      }
    }

    @media (max-width: 720px) {
      .chat-page {
        width: min(100% - 24px, 1240px);
      }

      .chat-header,
      .chat-shell-header,
      .header-actions,
      .composer-actions {
        flex-direction: column;
        align-items: flex-start;
      }

      .message {
        max-width: 100%;
      }

      .send-button {
        width: 100%;
      }
    }

    .typing {
      display: flex;
      gap: 4px;
    }

    .typing .dot {
      width: 8px;
      height: 8px;
      background: var(--accent-soft);
      border-radius: 50%;
      animation: bounce 1.4s infinite ease-in-out both;
    }

    .typing .dot:nth-child(1) { animation-delay: -0.32s; }
    .typing .dot:nth-child(2) { animation-delay: -0.16s; }

    @keyframes bounce {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1); }
    }

    .send-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .confirm-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .confirm-dialog {
      background: rgba(8, 18, 34, 0.95);
      padding: 24px;
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      text-align: center;
    }

    .confirm-dialog p {
      margin-bottom: 20px;
      font-size: 1.1rem;
    }

    .confirm-actions {
      display: flex;
      gap: 12px;
      justify-content: center;
    }

    .cancel-btn {
      padding: 10px 20px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      background: transparent;
      color: var(--text-primary);
      cursor: pointer;
    }

    .delete-confirm-btn {
      padding: 10px 20px;
      border-radius: 8px;
      border: none;
      background: #dc2626;
      color: white;
      cursor: pointer;
    }
  `
})
export class ChatComponent implements OnInit {
  userMessage = '';
  messages: Message[] = [];
  loading = false;
  connected = false;
  currentUser = '';
  
  conversations: Conversation[] = [];
  currentConversationId: number | null = null;
  currentConversationTitle = 'FinSight Assistant';
  showDeleteConfirm = false;
  confirmConvId: number | null = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser = this.authService.getUser()?.name || this.authService.getUser()?.username || '';
    this.checkConnection();
  }

  ngOnInit() {
    this.loadConversations();
  }

  getHeaders(): { [header: string]: string } {
    const token = this.authService.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  checkConnection() {
    this.http.get<{ status: string }>('/api/health').subscribe({
      next: () => this.connected = true,
      error: () => this.connected = false
    });
  }

  loadConversations() {
    this.http.get<{ conversations: Conversation[] }>('/api/chat/conversations', { headers: this.getHeaders() })
      .subscribe({
        next: (res) => {
          this.conversations = res.conversations;
          if (this.conversations.length > 0 && !this.currentConversationId) {
            this.selectConversation(this.conversations[0].id);
          }
        },
        error: (err) => console.error('Failed to load conversations:', err)
      });
  }

  selectConversation(id: number) {
    this.currentConversationId = id;
    const conv = this.conversations.find(c => c.id === id);
    this.currentConversationTitle = conv ? conv.title : 'FinSight Assistant';

    this.http.get<ConversationResponse>(`/api/chat/conversations/${id}`, { headers: this.getHeaders() })
      .subscribe({
        next: (res) => {
          this.messages = res.messages.map((m: { message: string; response: string; role: string }) => ({
            role: m.role as 'user' | 'assistant',
            content: m.role === 'user' ? m.message : m.response
          }));
          this.currentConversationTitle = res.conversation.title;
        },
        error: (err) => console.error('Failed to load conversation:', err)
      });
  }

  createConversation() {
    this.http.post<{ conversation: Conversation }>('/api/chat/conversations', 
      { title: 'New Chat' },
      { headers: this.getHeaders() }
    ).subscribe({
      next: (res) => {
        this.conversations.unshift(res.conversation);
        this.selectConversation(res.conversation.id);
      },
      error: (err) => console.error('Failed to create conversation:', err)
    });
  }

  confirmDelete(id: number) {
    this.confirmConvId = id;
    this.showDeleteConfirm = true;
  }

  deleteConversation() {
    if (!this.confirmConvId) return;
    
    const idToDelete = this.confirmConvId;
    this.showDeleteConfirm = false;
    this.confirmConvId = null;

    this.http.delete<{ message: string }>(`/api/chat/conversations/${idToDelete}`, { headers: this.getHeaders() })
      .subscribe({
        next: () => {
          this.conversations = this.conversations.filter(c => c.id !== idToDelete);
          if (this.currentConversationId === idToDelete) {
            this.messages = [];
            this.currentConversationId = null;
            this.currentConversationTitle = 'FinSight Assistant';
            if (this.conversations.length > 0) {
              this.selectConversation(this.conversations[0].id);
            }
          }
        },
        error: (err) => console.error('Failed to delete conversation:', err)
      });
  }

  sendMessage(event?: Event) {
    if (event) {
      event.preventDefault();
    }

    const message = this.userMessage.trim();
    if (!message || this.loading) return;

    this.messages.push({ role: 'user', content: message });
    this.userMessage = '';
    this.loading = true;

    const payload: any = { message };
    if (this.currentConversationId) {
      payload.conversationId = this.currentConversationId;
    }

    this.http.post<{ response: string; conversationId: number }>('/api/chat', payload, {
      headers: this.getHeaders()
    }).subscribe({
      next: (res) => {
        this.messages.push({ role: 'assistant', content: res.response });
        this.loading = false;
        this.currentConversationId = res.conversationId;
        this.loadConversations();
      },
      error: (error) => {
        if (error.status === 401) {
          this.authService.logout();
          this.router.navigate(['/auth']);
          return;
        }

        this.messages.push({ 
          role: 'assistant', 
          content: 'Sorry, I encountered an error. Please try again.' 
        });
        this.loading = false;
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }
}
