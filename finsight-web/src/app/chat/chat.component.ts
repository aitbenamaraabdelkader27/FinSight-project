import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="chat-page">
      <header class="chat-header">
        <a class="brand" routerLink="/" aria-label="Back to FinSight landing page">
          <span class="brand-mark">FS</span>
          <span class="brand-text">FinSight</span>
        </a>

        <a class="header-link" routerLink="/">Back to landing</a>
      </header>

      <main class="chat-layout">
        <section class="chat-sidebar">
          <p class="sidebar-kicker">Workspace</p>
          <h1>Chat Interface</h1>
          <p class="sidebar-text">
            This screen is ready for your chatbot connection layer. The layout already
            separates conversation history, status, and message composition.
          </p>

          <div class="sidebar-card">
            <p class="sidebar-card-title">Planned integration</p>
            <ul>
              <li>Connect send action to the local chatbot service.</li>
              <li>Stream model responses into the conversation panel.</li>
              <li>Display command mode and analysis metadata.</li>
            </ul>
          </div>

          <div class="sidebar-card">
            <p class="sidebar-card-title">Expected commands</p>
            <div class="command-list">
              <span>!analyse</span>
              <span>!summary</span>
              <span>!explain</span>
              <span>!ping</span>
            </div>
          </div>
        </section>

        <section class="chat-shell" aria-label="Chat preview">
          <div class="chat-shell-header">
            <div>
              <p class="chat-shell-kicker">Session</p>
              <h2>FinSight Assistant</h2>
            </div>

            <span class="status-pill">Local mode</span>
          </div>

          <div class="chat-thread">
            <article class="message assistant">
              <p class="message-role">FinSight</p>
              <p class="message-text">
                Ready for structured financial requests. Connect this interface to your
                chatbot backend when the service layer is available.
              </p>
            </article>

            <article class="message user">
              <p class="message-role">User</p>
              <p class="message-text">
                Explain EBITDA and give the business interpretation.
              </p>
            </article>

            <article class="message assistant">
              <p class="message-role">FinSight</p>
              <p class="message-text">
                Summary: EBITDA measures operating performance before interest, taxes,
                depreciation, and amortization.
              </p>
              <p class="message-text">
                Key Insights: It helps compare core profitability across businesses with
                different capital structures.
              </p>
              <p class="message-text">
                Recommendations: Use it with margin and cash flow indicators instead of
                treating it as a standalone view of financial health.
              </p>
            </article>
          </div>

          <div class="composer-card">
            <label class="composer-label" for="chat-message">Message</label>
            <textarea
              id="chat-message"
              class="composer-input"
              placeholder="Type a financial request or command..."
            ></textarea>

            <div class="composer-actions">
              
              <button class="send-button" type="button">Send</button>
            </div>
          </div>
        </section>
      </main>
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
  `
})
export class ChatComponent {}
