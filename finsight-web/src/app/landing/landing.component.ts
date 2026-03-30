import { Component } from '@angular/core';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [],
  template: `
    <div class="hero">
      <div class="hero-content">
        <div class="logo">
          <span class="logo-icon">◆</span>
          <span class="logo-text">FinSight</span>
        </div>
        <h1>Your Financial Intelligence Assistant</h1>
        <p class="tagline">
          Empowering KPMG Financial Officers with intelligent automation.
          AI-powered chatbot running locally — no external APIs.
        </p>
        <div class="cta-container">
          <button class="cta-button">Try FinSight</button>
        </div>
        <div class="features-preview">
          <span class="feature-badge">Compliance</span>
          <span class="feature-badge">Reporting</span>
          <span class="feature-badge">Tax Support</span>
          <span class="feature-badge">Analysis</span>
        </div>
      </div>
    </div>
  `,
  styles: `
    .hero {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0a1628 0%, #1a2744 100%);
      color: white;
      font-family: 'Segoe UI', system-ui, sans-serif;
    }
    
    .hero-content {
      text-align: center;
      max-width: 800px;
      padding: 2rem;
    }
    
    .logo {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      margin-bottom: 2rem;
    }
    
    .logo-icon {
      font-size: 2.5rem;
      color: #FFCC00;
    }
    
    .logo-text {
      font-size: 2rem;
      font-weight: 700;
      letter-spacing: 0.1em;
    }
    
    h1 {
      font-size: 3rem;
      font-weight: 700;
      margin-bottom: 1.5rem;
      background: linear-gradient(90deg, #ffffff, #94a3b8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .tagline {
      font-size: 1.25rem;
      color: #94a3b8;
      line-height: 1.6;
      margin-bottom: 2.5rem;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }
    
    .cta-container {
      margin-bottom: 2rem;
    }
    
    .cta-button {
      background: #FFCC00;
      color: #0a1628;
      border: none;
      padding: 1rem 2.5rem;
      font-size: 1.1rem;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(255, 204, 0, 0.3);
    }
    
    .features-preview {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }
    
    .feature-badge {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.875rem;
      color: #94a3b8;
    }
    
    @media (max-width: 768px) {
      h1 {
        font-size: 2rem;
      }
      .tagline {
        font-size: 1rem;
      }
    }
  `
})
export class LandingComponent {}
