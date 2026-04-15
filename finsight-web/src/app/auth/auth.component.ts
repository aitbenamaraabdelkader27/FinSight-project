import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <header class="auth-header">
        <a class="brand" routerLink="/" aria-label="Back to FinSight landing page">
          <img class="brand-logo" src="assets/logo/FinSight.jpg" alt="FinSight logo">
          <span class="brand-text">FinSight</span>
        </a>

        <a class="header-link" routerLink="/">Back to landing</a>
      </header>

      <main class="auth-layout">
        <section class="auth-copy">
          <p class="section-kicker">Secure workspace access</p>
          <h1>Sign in before opening the FinSight chatbot.</h1>
          <p>
            Create an account or log in to keep your assistant workspace connected
            to your session and chat history.
          </p>
        </section>

        <section class="auth-card" aria-label="Authentication form">
          <div class="auth-tabs" role="tablist" aria-label="Choose authentication mode">
            <button
              type="button"
              [class.active]="mode === 'login'"
              (click)="setMode('login')"
            >
              Login
            </button>
            <button
              type="button"
              [class.active]="mode === 'register'"
              (click)="setMode('register')"
            >
              Register
            </button>
          </div>

          <form *ngIf="mode === 'login'" (ngSubmit)="submitLogin()" class="auth-form">
            <div>
              <label for="login-email">Email</label>
              <input
                id="login-email"
                name="loginEmail"
                type="email"
                autocomplete="email"
                [(ngModel)]="loginEmail"
                required
              />
            </div>

            <div>
              <label for="login-password">Password</label>
              <input
                id="login-password"
                name="loginPassword"
                type="password"
                autocomplete="current-password"
                [(ngModel)]="loginPassword"
                required
              />
            </div>

            <button class="submit-button" type="submit" [disabled]="loading">
              {{ loading ? 'Signing in...' : 'Login' }}
            </button>
          </form>

          <form *ngIf="mode === 'register'" (ngSubmit)="submitRegister()" class="auth-form">
            <div>
              <label for="register-name">Name</label>
              <input
                id="register-name"
                name="registerName"
                type="text"
                autocomplete="name"
                [(ngModel)]="registerName"
                required
              />
            </div>

            <div>
              <label for="register-email">Email</label>
              <input
                id="register-email"
                name="registerEmail"
                type="email"
                autocomplete="email"
                [(ngModel)]="registerEmail"
                required
              />
            </div>

            <div>
              <label for="register-password">Password</label>
              <input
                id="register-password"
                name="registerPassword"
                type="password"
                autocomplete="new-password"
                [(ngModel)]="registerPassword"
                required
                minlength="6"
              />
            </div>

            <button class="submit-button" type="submit" [disabled]="loading">
              {{ loading ? 'Creating account...' : 'Create account' }}
            </button>
          </form>

          <p class="form-message success" *ngIf="successMessage">{{ successMessage }}</p>
          <p class="form-message error" *ngIf="errorMessage">{{ errorMessage }}</p>
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

    .auth-page {
      width: min(1120px, calc(100% - 40px));
      margin: 0 auto;
      padding: 24px 0 48px;
    }

    .auth-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      padding: 16px 20px;
      margin-bottom: 56px;
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

    .brand-logo {
      width: 42px;
      height: 42px;
      display: block;
      border-radius: 8px;
      object-fit: cover;
      box-shadow: 0 10px 30px rgba(91, 188, 255, 0.18);
    }

    .header-link {
      color: var(--text-secondary);
      text-decoration: none;
      font-weight: 600;
    }

    .auth-layout {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(340px, 440px);
      gap: 36px;
      align-items: center;
    }

    .section-kicker {
      text-transform: uppercase;
      letter-spacing: 0.18em;
      font-size: 0.77rem;
      color: var(--accent-soft);
      margin-bottom: 18px;
    }

    h1,
    p {
      margin: 0;
    }

    h1 {
      font-size: clamp(2.5rem, 5vw, 4.8rem);
      line-height: 0.98;
      letter-spacing: -0.04em;
      max-width: 11ch;
      margin-bottom: 22px;
    }

    .auth-copy p {
      color: var(--text-secondary);
      line-height: 1.75;
      max-width: 58ch;
      font-size: 1.04rem;
    }

    .auth-card {
      padding: 26px;
      background: rgba(8, 18, 34, 0.72);
      border: 1px solid rgba(143, 169, 200, 0.14);
      border-radius: 28px;
      box-shadow: var(--panel-shadow);
    }

    .auth-tabs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      padding: 6px;
      margin-bottom: 22px;
      border-radius: 18px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .auth-tabs button {
      border: 0;
      border-radius: 14px;
      padding: 12px;
      color: var(--text-secondary);
      background: transparent;
      cursor: pointer;
      font-weight: 700;
    }

    .auth-tabs button.active {
      color: #09213a;
      background: linear-gradient(135deg, #d8f3ff, #79c5ff);
    }

    .auth-form {
      display: grid;
      gap: 16px;
    }

    label {
      display: block;
      margin-bottom: 8px;
      color: var(--text-secondary);
      font-size: 0.92rem;
    }

    input {
      width: 100%;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      background: rgba(5, 12, 23, 0.8);
      color: var(--text-primary);
      padding: 14px 16px;
      font: inherit;
      outline: none;
    }

    input:focus {
      border-color: rgba(143, 216, 255, 0.65);
    }

    .submit-button {
      border: 0;
      border-radius: 999px;
      padding: 14px 20px;
      color: #09213a;
      background: linear-gradient(135deg, #d8f3ff, #79c5ff);
      font-weight: 800;
      cursor: pointer;
      margin-top: 6px;
    }

    .submit-button:disabled {
      opacity: 0.65;
      cursor: not-allowed;
    }

    .form-message {
      margin-top: 18px;
      padding: 12px 14px;
      border-radius: 14px;
      line-height: 1.5;
    }

    .form-message.success {
      color: #b9f0d0;
      background: rgba(78, 196, 126, 0.1);
      border: 1px solid rgba(78, 196, 126, 0.18);
    }

    .form-message.error {
      color: #ffd1d1;
      background: rgba(255, 108, 108, 0.1);
      border: 1px solid rgba(255, 108, 108, 0.2);
    }

    @media (max-width: 860px) {
      .auth-layout {
        grid-template-columns: 1fr;
      }

      h1 {
        max-width: none;
      }
    }

    @media (max-width: 620px) {
      .auth-page {
        width: min(100% - 28px, 1120px);
        padding-top: 16px;
      }

      .auth-header {
        align-items: flex-start;
        flex-direction: column;
        margin-bottom: 36px;
      }
    }
  `
})
export class AuthComponent {
  mode: 'login' | 'register' = 'login';
  loginEmail = '';
  loginPassword = '';
  registerName = '';
  registerEmail = '';
  registerPassword = '';
  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  setMode(mode: 'login' | 'register'): void {
    this.mode = mode;
    this.successMessage = '';
    this.errorMessage = '';
  }

  submitLogin(): void {
    if (!this.loginEmail.trim() || !this.loginPassword) {
      this.errorMessage = 'Please enter your email and password.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.loginEmail, this.loginPassword).subscribe({
      next: () => this.handleSuccess('Login successful. Opening the chatbot...'),
      error: (error) => this.handleError(error)
    });
  }

  submitRegister(): void {
    if (!this.registerName.trim() || !this.registerEmail.trim() || !this.registerPassword) {
      this.errorMessage = 'Please complete all register fields.';
      return;
    }

    if (this.registerPassword.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.register(this.registerName, this.registerEmail, this.registerPassword).subscribe({
      next: () => this.handleSuccess('Account created. Opening the chatbot...'),
      error: (error) => this.handleError(error)
    });
  }

  private handleSuccess(message: string): void {
    this.loading = false;
    this.successMessage = message;
    this.router.navigate(['/chat']);
  }

  private handleError(error: { error?: { error?: string } }): void {
    this.loading = false;
    this.successMessage = '';
    this.errorMessage = error.error?.error || 'Authentication failed. Please try again.';
  }
}
