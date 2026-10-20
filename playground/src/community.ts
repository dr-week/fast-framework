import { html, render } from '@zuari/dom';
import { signal } from '@zuari/signals';
import { createUiToast } from '@zuari/ui';

export function createShareAndFeedbackModal(): HTMLElement {
  const isOpen = signal(false);
  const activeTab = signal<'share' | 'feedback'>('share');
  const feedbackCategory = signal<'feature' | 'bug' | 'ux' | 'perf' | 'general'>('feature');
  const userRole = signal<'developer' | 'ai-architect' | 'student' | 'cto'>('developer');
  const userMessage = signal('');
  const userEmail = signal('');

  const toast = createUiToast({ position: 'bottom-right' });
  document.body.appendChild(toast.container);

  const container = document.createElement('div');
  container.className = 'zuari-community-widget';

  const shareText = encodeURIComponent('Building zero-lag, zero-Virtual-DOM web apps (<2.5KB) with Zuari by Danger.Labs!');
  const shareUrl = encodeURIComponent('https://dr-week.github.io/fast-framework/');

  function getMailtoUrl(): string {
    const to = 'dangerlabs.research@gmail.com'; // or team inbox
    const subject = encodeURIComponent(`[Zuari ${feedbackCategory.value.toUpperCase()}]: Feedback from ${userRole.value}`);
    const body = encodeURIComponent(
      `Hello Danger.Labs Team,\n\n` +
      `Here is structured feedback regarding the Zuari Framework:\n\n` +
      `• Category: ${feedbackCategory.value}\n` +
      `• Submitter Role: ${userRole.value}\n` +
      `• Submitter Email: ${userEmail.value || 'Anonymous'}\n\n` +
      `Details / Query / Suggestions:\n${userMessage.value || '(Please enter your details here)'}\n\n` +
      `---\nSent from Zuari Interactive Showcase Hub.`
    );
    return `mailto:${to}?subject=${subject}&body=${body}`;
  }

  const view = html`
    <div class="community-trigger-row">
      <button
        type="button"
        class="community-pill-btn share-trigger"
        @click=${() => { isOpen.value = true; activeTab.value = 'share'; }}
        title="Share Zuari Framework"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
        </svg>
        <span>Share</span>
      </button>

      <button
        type="button"
        class="community-pill-btn feedback-trigger"
        @click=${() => { isOpen.value = true; activeTab.value = 'feedback'; }}
        title="Send Structured Feedback or Question"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <span>Feedback &amp; Queries</span>
      </button>
    </div>

    ${() => (isOpen.value ? html`
      <div class="community-modal-backdrop" @click=${(e: MouseEvent) => { if (e.target === e.currentTarget) isOpen.value = false; }}>
        <div class="community-modal-card" role="dialog" aria-modal="true" aria-label="Community Hub">
          <header class="community-modal-header">
            <div class="modal-tab-pills">
              <button
                type="button"
                class="modal-tab-btn"
                data-active=${() => String(activeTab.value === 'share')}
                @click=${() => { activeTab.value = 'share'; }}
              >
                Share Zuari
              </button>
              <button
                type="button"
                class="modal-tab-btn"
                data-active=${() => String(activeTab.value === 'feedback')}
                @click=${() => { activeTab.value = 'feedback'; }}
              >
                Send Feedback by Email
              </button>
            </div>
            <button
              type="button"
              class="modal-close-btn"
              @click=${() => { isOpen.value = false; }}
              aria-label="Close modal"
            >×</button>
          </header>

          <div class="community-modal-body">
            ${() => (activeTab.value === 'share' ? html`
              <div class="share-tab-content">
                <h3 class="share-title">Broadcast Zuari to the Open Web</h3>
                <p class="share-desc">Share zero-VDOM speed (<2.5KB) with engineers on your favorite network:</p>
                
                <div class="social-share-grid">
                  <a
                    href="https://x.com/intent/tweet?text=${shareText}&url=${shareUrl}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="social-btn social-x"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    <span>Post on X / Twitter</span>
                  </a>

                  <a
                    href="https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="social-btn social-linkedin"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                    <span>Share on LinkedIn</span>
                  </a>

                  <a
                    href="https://reddit.com/submit?url=${shareUrl}&title=${shareText}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="social-btn social-reddit"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701z"/>
                    </svg>
                    <span>Post on Reddit</span>
                  </a>

                  <button
                    type="button"
                    class="social-btn social-copy"
                    @click=${() => {
                      navigator.clipboard?.writeText('https://dr-week.github.io/fast-framework/');
                      toast.success('Link Copied!', 'Website URL copied to clipboard.');
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                    </svg>
                    <span>Copy Share Link</span>
                  </button>
                </div>
              </div>
            ` : html`
              <form class="feedback-form" @submit=${(e: Event) => {
                e.preventDefault();
                const mailto = getMailtoUrl();
                window.location.href = mailto;
                toast.info('Opening Email Client', 'Generating structured email template...');
              }}>
                <div class="form-row">
                  <label class="form-label">Category</label>
                  <select
                    class="form-select"
                    .value=${feedbackCategory.value}
                    @change=${(e: Event) => { feedbackCategory.value = (e.target as HTMLSelectElement).value as any; }}
                  >
                    <option value="feature">Feature Request / Idea</option>
                    <option value="ux">UI/UX &amp; Component Design</option>
                    <option value="bug">Bug Report / Edge Case</option>
                    <option value="perf">Performance Benchmark</option>
                    <option value="general">General Question / Query</option>
                  </select>
                </div>

                <div class="form-row">
                  <label class="form-label">Your Role / Usage</label>
                  <select
                    class="form-select"
                    .value=${userRole.value}
                    @change=${(e: Event) => { userRole.value = (e.target as HTMLSelectElement).value as any; }}
                  >
                    <option value="developer">Frontend Engineer</option>
                    <option value="ai-architect">AI Coding Agent / Prompt Engineer</option>
                    <option value="cto">CTO / Technical Architect</option>
                    <option value="student">Student / Hobbyist</option>
                  </select>
                </div>

                <div class="form-row">
                  <label class="form-label">Your Email (Optional)</label>
                  <input
                    type="email"
                    class="form-input"
                    placeholder="you@domain.com"
                    .value=${userEmail.value}
                    @input=${(e: Event) => { userEmail.value = (e.target as HTMLInputElement).value; }}
                  />
                </div>

                <div class="form-row">
                  <label class="form-label">Your Query / Feedback</label>
                  <textarea
                    class="form-textarea"
                    rows="4"
                    placeholder="What feature would you like to see? Which component or layout need improvements?"
                    .value=${userMessage.value}
                    @input=${(e: Event) => { userMessage.value = (e.target as HTMLTextAreaElement).value; }}
                    required
                  ></textarea>
                </div>

                <div class="form-actions">
                  <button type="submit" class="submit-email-btn">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                    <span>Generate Structured Email</span>
                  </button>
                  <a
                    href="https://github.com/dr-week/fast-framework/issues/new"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="github-issue-link"
                  >
                    Or open GitHub Issue →
                  </a>
                </div>
              </form>
            `)}
          </div>
        </div>
      </div>
    ` : '')}
  `;

  render(view, container);
  return container;
}
