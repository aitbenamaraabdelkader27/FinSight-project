import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="page-shell">
      <header class="topbar">
        <a class="brand" href="#hero" aria-label="FinSight home">
          <img class="brand-logo" src="assets/logo/FinSight.jpg" alt="FinSight logo">
          <span class="brand-text">FinSight</span>
        </a>

        <nav class="topbar-nav" aria-label="Primary navigation">
          <a href="#features">Features</a>
          <a href="#workflow">Workflow</a>
          <a href="#architecture">Architecture</a>
          <a href="#video">Video</a>
          <a href="#reporting">Reporting</a>
        </nav>
      </header>

      <main>
        <section class="hero-section" id="hero">
          <div class="hero-copy">
            <p class="eyebrow">AI financial assistant for consulting-grade workflows</p>
            <h1>Local intelligence for faster financial analysis and clearer decisions.</h1>
            <p class="hero-text">
              FinSight combines a disciplined business logic layer with a local LLM via
              Mistral Nemo to deliver structured analysis, summaries, and financial
              explanations without relying on paid APIs.
            </p>

            <div class="hero-actions">
              <a class="primary-action" href="#features">Explore the platform</a>
              <a class="secondary-action" routerLink="/auth">Open chat interface</a>
            </div>

            <ul class="hero-metrics" aria-label="Key product metrics">
              <li>
                <strong>100%</strong>
                <span>Local model execution</span>
              </li>
              <li>
                <strong>3 core modes</strong>
                <span>Analyse, summary, explain</span>
              </li>
              <li>
                <strong>Structured</strong>
                <span>Guardrails before every response</span>
              </li>
            </ul>
          </div>

          <aside class="hero-panel" aria-label="FinSight response preview">
            <div class="panel-card">
              <div class="panel-head">
                <span class="panel-title">Discord assistant preview</span>
                <span class="panel-status">LM Studio connected</span>
              </div>

              <div class="message-block user-message">
                <p class="message-label">Input</p>
                <p><code>!analyse data/financial-data.json</code></p>
              </div>

              <div class="message-block bot-message">
                <p class="message-label">Output</p>
                <p class="message-section-title">Summary:</p>
                <p>Revenue is increasing faster than operating costs, but margin pressure remains visible.</p>
                <p class="message-section-title">Key Insights:</p>
                <ul>
                  <li>Revenue growth is positive and sustained.</li>
                  <li>Marketing spending is accelerating faster than margin recovery.</li>
                  <li>Decision-makers need clearer cost discipline on non-core spend.</li>
                </ul>
                <p class="message-section-title">Recommendations:</p>
                <ul>
                  <li>Review marketing efficiency against pipeline contribution.</li>
                  <li>Track gross margin by period before scaling spend further.</li>
                </ul>
              </div>
            </div>
          </aside>
        </section>

        <section class="section-grid" id="features">
          <div class="section-heading">
            <p class="section-kicker">Core capabilities</p>
            <h2>Built for reliable financial assistance, not generic text generation.</h2>
          </div>

          <div class="card-grid">
            <article class="feature-card">
              <span class="card-index">01</span>
              <h3>Financial Analysis</h3>
              <p>
                FinSight computes metrics first, then prompts the model with structured
                facts so recommendations remain grounded in actual business changes.
              </p>
            </article>

            <article class="feature-card">
              <span class="card-index">02</span>
              <h3>Report Summaries</h3>
              <p>
                Long business or financial text is compressed into concise summaries,
                highlighted risks, and direct action points for faster executive review.
              </p>
            </article>

            <article class="feature-card">
              <span class="card-index">03</span>
              <h3>Term Explanations</h3>
              <p>
                Financial concepts such as EBITDA, margin, or cash burn are explained
                with a definition, formula, and business interpretation.
              </p>
            </article>
          </div>
        </section>

        <section class="workflow-section" id="workflow">
          <div class="section-heading">
            <p class="section-kicker">Operational logic</p>
            <h2>The intelligence lives in the system design.</h2>
          </div>

          <div class="workflow-steps">
            <article class="workflow-step">
              <span class="step-number">1</span>
              <h3>Input normalization</h3>
              <p>Financial JSON or business text is validated before any model call.</p>
            </article>

            <article class="workflow-step">
              <span class="step-number">2</span>
              <h3>Metric computation</h3>
              <p>Variations, deltas, and margin signals are computed in application logic.</p>
            </article>

            <article class="workflow-step">
              <span class="step-number">3</span>
              <h3>Guarded prompting</h3>
              <p>The local LLM receives a clear task, bounded context, and strict format.</p>
            </article>

            <article class="workflow-step">
              <span class="step-number">4</span>
              <h3>Structured output</h3>
              <p>Responses are returned as summary, insights, and recommendations only.</p>
            </article>
          </div>
        </section>

        <section class="architecture-section" id="architecture">
          <div class="section-heading">
            <p class="section-kicker">Technical flow</p>
            <h2>Modular architecture designed for clarity and control.</h2>
          </div>

          <div class="architecture-layout">
            <div class="architecture-chain">
              <div class="chain-node">User</div>
              <div class="chain-arrow">→</div>
              <div class="chain-node">Discord Bot</div>
              <div class="chain-arrow">→</div>
              <div class="chain-node">Command Handler</div>
              <div class="chain-arrow">→</div>
              <div class="chain-node">Business Logic</div>
              <div class="chain-arrow">→</div>
              <div class="chain-node">LM Studio API</div>
              <div class="chain-arrow">→</div>
              <div class="chain-node">Structured Response</div>
            </div>

            <div class="architecture-notes">
              <article>
                <h3>Local by design</h3>
                <p>
                  Mistral Nemo runs through LM Studio on a local HTTP endpoint,
                  avoiding dependency on paid external APIs.
                </p>
              </article>
              <article>
                <h3>Business-safe prompting</h3>
                <p>
                  Missing data is surfaced explicitly, calculations stay outside the
                  model, and hallucination risk is reduced through structured inputs.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section class="video-section" id="video">
          <div class="section-heading">
            <p class="section-kicker">Project presentation</p>
            <h2>FinSight demo video.</h2>
          </div>

          <div class="video-layout">
            <div class="video-copy">
              <h3>Presentation video</h3>
              <p>
                This is the presentation video for the project.
                
              </p>
            </div>

            <div class="video-placeholder" aria-label="Project presentation video placeholder">
              <p>Project presentation video coming soon</p>
              <small>Replace this block with an embedded video or local file.</small>
            </div>
          </div>
        </section>

        <section class="reporting-section" id="reporting">
          <div class="report-card">
            <div>
              <p class="section-kicker">Business value</p>
              <h2>Designed to support consulting, finance, and internal decision support teams.</h2>
            </div>

            <div class="report-points">
              <p>Professional tone aligned with business reporting workflows.</p>
              <p>Minimal and readable interface for demonstrations and project delivery.</p>
              <p>Clear separation between interface, reasoning logic, and model access.</p>
              <a class="report-link" routerLink="/auth">Go to the FinSight chat workspace</a>
            </div>
          </div>
        </section>
      </main>
    </div>
  `,
  styles: `
    :host {
      display: block;
      color: var(--text-primary);
    }

    .page-shell {
      width: min(1200px, calc(100% - 48px));
      margin: 0 auto;
      padding: 24px 0 56px;
    }

    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
      margin-bottom: 56px;
      padding: 16px 20px;
      background: rgba(44, 102, 176, 0.42);
      border: 1px solid rgba(157, 201, 255, 0.24);
      border-radius: 22px;
      backdrop-filter: blur(18px);
      position: sticky;
      top: 16px;
      z-index: 10;
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

    .brand-text {
      font-size: 1rem;
    }

    .topbar-nav {
      display: flex;
      flex-wrap: wrap;
      gap: 18px;
    }

    .topbar-nav a {
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 0.95rem;
      transition: color 0.2s ease;
    }

    .topbar-nav a:hover {
      color: var(--text-primary);
    }

    .hero-section {
      display: grid;
      grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.85fr);
      gap: 36px;
      align-items: center;
      margin-bottom: 72px;
    }

    .eyebrow,
    .section-kicker {
      text-transform: uppercase;
      letter-spacing: 0.18em;
      font-size: 0.77rem;
      color: var(--accent-soft);
      margin-bottom: 18px;
    }

    h1,
    h2,
    h3,
    p {
      margin: 0;
    }

    h1 {
      font-size: clamp(2.8rem, 5vw, 5.4rem);
      line-height: 0.96;
      letter-spacing: -0.04em;
      max-width: 12ch;
      margin-bottom: 20px;
    }

    .hero-text {
      max-width: 62ch;
      color: var(--text-secondary);
      font-size: 1.05rem;
      line-height: 1.75;
      margin-bottom: 28px;
    }

    .hero-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 14px;
      margin-bottom: 32px;
    }

    .hero-actions a {
      text-decoration: none;
      border-radius: 999px;
      padding: 14px 22px;
      font-weight: 600;
      transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
    }

    .hero-actions a:hover {
      transform: translateY(-1px);
    }

    .primary-action {
      color: #09213a;
      background: linear-gradient(135deg, #d8f3ff, #79c5ff);
      box-shadow: 0 14px 40px rgba(121, 197, 255, 0.25);
    }

    .secondary-action {
      color: var(--text-primary);
      border: 1px solid rgba(173, 195, 220, 0.25);
      background: rgba(10, 23, 43, 0.5);
    }

    .hero-metrics {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 16px;
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .hero-metrics li,
    .feature-card,
    .workflow-step,
    .architecture-notes article,
    .report-card {
      background: rgba(8, 18, 34, 0.64);
      border: 1px solid rgba(143, 169, 200, 0.14);
      border-radius: 24px;
      box-shadow: var(--panel-shadow);
    }

    .hero-metrics li {
      padding: 20px;
    }

    .hero-metrics strong {
      display: block;
      font-size: 1.05rem;
      margin-bottom: 8px;
    }

    .hero-metrics span {
      color: var(--text-muted);
      line-height: 1.5;
      font-size: 0.94rem;
    }

    .panel-card {
      padding: 22px;
      border-radius: 28px;
      background:
        linear-gradient(180deg, rgba(14, 29, 52, 0.92), rgba(6, 14, 28, 0.92));
      border: 1px solid rgba(161, 190, 222, 0.16);
      box-shadow: 0 28px 80px rgba(0, 0, 0, 0.35);
    }

    .panel-head {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: center;
      margin-bottom: 18px;
      font-size: 0.88rem;
    }

    .panel-title {
      font-weight: 600;
    }

    .panel-status {
      color: #9ee2bf;
    }

    .message-block {
      padding: 16px 18px;
      border-radius: 18px;
      margin-bottom: 14px;
    }

    .user-message {
      background: rgba(130, 181, 255, 0.1);
      border: 1px solid rgba(130, 181, 255, 0.16);
    }

    .bot-message {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .message-label {
      color: var(--text-muted);
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      margin-bottom: 10px;
    }

    .message-section-title {
      color: var(--accent-soft);
      font-weight: 700;
      margin-top: 12px;
      margin-bottom: 6px;
    }

    code {
      font-family: "Consolas", "SFMono-Regular", monospace;
      color: #d6ecff;
    }

    .message-block ul {
      margin: 0;
      padding-left: 18px;
      color: var(--text-secondary);
      line-height: 1.6;
    }

    .section-grid,
    .workflow-section,
    .architecture-section,
    .video-section,
    .reporting-section {
      margin-bottom: 72px;
    }

    .section-heading {
      max-width: 760px;
      margin-bottom: 28px;
    }

    h2 {
      font-size: clamp(2rem, 3vw, 3rem);
      line-height: 1.05;
      letter-spacing: -0.03em;
    }

    .card-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 20px;
    }

    .feature-card,
    .workflow-step,
    .architecture-notes article {
      padding: 24px;
    }

    .card-index,
    .step-number {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 38px;
      height: 38px;
      border-radius: 50%;
      margin-bottom: 18px;
      color: #081d35;
      background: linear-gradient(135deg, #f5f7d4, #b7f0da);
      font-weight: 700;
    }

    h3 {
      margin-bottom: 12px;
      font-size: 1.2rem;
    }

    .feature-card p,
    .workflow-step p,
    .architecture-notes p,
    .report-points p {
      color: var(--text-secondary);
      line-height: 1.7;
    }

    .workflow-steps {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 18px;
    }

    .architecture-layout {
      display: grid;
      grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
      gap: 20px;
      align-items: start;
    }

    .architecture-chain {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      align-items: center;
      padding: 28px;
      background: rgba(8, 18, 34, 0.64);
      border: 1px solid rgba(143, 169, 200, 0.14);
      border-radius: 28px;
      box-shadow: var(--panel-shadow);
    }

    .chain-node {
      padding: 14px 16px;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
      font-weight: 600;
      text-align: center;
    }

    .chain-arrow {
      color: var(--accent-soft);
      font-size: 1.2rem;
    }

    .architecture-notes {
      display: grid;
      gap: 16px;
    }

    .video-layout {
      display: grid;
      grid-template-columns: minmax(260px, 0.7fr) minmax(0, 1.3fr);
      gap: 20px;
      align-items: stretch;
    }

    .video-copy,
    .video-placeholder {
      background: rgba(8, 18, 34, 0.64);
      border: 1px solid rgba(143, 169, 200, 0.14);
      border-radius: 24px;
    }

    .video-copy {
      padding: 24px;
    }

    .video-copy p {
      color: var(--text-secondary);
      line-height: 1.7;
    }

    .video-placeholder {
      min-height: 320px;
      display: grid;
      place-items: center;
      align-content: center;
      gap: 12px;
      padding: 28px;
    }

    .video-placeholder p {
      font-size: 1.2rem;
      font-weight: 800;
    }

    .report-card {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(280px, 0.85fr);
      gap: 24px;
      padding: 28px;
    }

    .report-points {
      display: grid;
      gap: 12px;
    }

    .report-link {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: fit-content;
      margin-top: 8px;
      padding: 14px 20px;
      border-radius: 999px;
      color: #09213a;
      background: linear-gradient(135deg, #d8f3ff, #79c5ff);
      text-decoration: none;
      font-weight: 700;
      box-shadow: 0 14px 40px rgba(121, 197, 255, 0.2);
    }

    @media (max-width: 1080px) {
      .hero-section,
      .architecture-layout,
      .report-card,
      .video-layout,
      .card-grid,
      .workflow-steps {
        grid-template-columns: 1fr;
      }

      .hero-metrics {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 760px) {
      .page-shell {
        width: min(100% - 32px, 1200px);
        padding-top: 16px;
      }

      .topbar {
        position: static;
        padding: 16px;
      }

      .topbar-nav {
        display: none;
      }

      h1 {
        max-width: none;
      }

      .hero-actions a {
        width: 100%;
        text-align: center;
      }

      .panel-head {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `
})
export class LandingComponent {}
