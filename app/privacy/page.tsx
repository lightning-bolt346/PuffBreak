import React from 'react';
import Link from 'next/link';
import { Shield, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy',
  description: 'Read the PuffBreak privacy policy. Anonymity by design: no accounts, no personal data collection, and only privacy-respecting aggregate analytics.',
  alternates: {
    canonical: 'https://puff-break.vercel.app/privacy',
  },
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#0a0a12] text-gray-200 font-display selection:bg-emerald-500/30 overflow-x-hidden relative">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-white/[0.06] bg-[#0a0a12]/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Break Room</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-lg">🚬</span>
            <span className="font-bold text-white text-sm tracking-wide">PuffBreak</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 pt-20 pb-32 relative z-10">
        <header className="mb-14">
          <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mb-6">
            <Shield className="w-7 h-7 text-emerald-400" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight leading-tight">
            Privacy Policy
          </h1>
          <p className="inline-flex items-center gap-2 text-xs font-medium text-emerald-300/90 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Anonymity by design
          </p>
          <p className="text-gray-500 text-sm mt-4">
            Last updated: June 27, 2026
          </p>
        </header>

        <div className="prose prose-invert prose-emerald max-w-none
                        prose-headings:text-white prose-headings:font-bold prose-headings:tracking-tight
                        prose-h2:text-2xl prose-h2:mt-14 prose-h2:mb-6
                        prose-p:text-gray-300 prose-p:leading-relaxed
                        prose-a:text-emerald-400 hover:prose-a:text-emerald-300
                        prose-strong:text-white
                        prose-li:text-gray-300 prose-li:leading-relaxed prose-li:mb-2
                        marker:text-emerald-400">
          <h2>1. Introduction</h2>
          <p>
            At <strong>PuffBreak</strong>, we believe that taking a break should be a completely private and stress-free experience. 
            Our privacy policy is incredibly simple: <strong>we do not collect, store, or sell your personal data.</strong>
          </p>

          <h2>2. Data Collection and Usage</h2>
          <p>
            PuffBreak is designed to function entirely within your browser. We do not require you to create an account, log in, or provide any personal information.
          </p>
          <ul>
            <li><strong>Aggregate Analytics:</strong> We use privacy-respecting, aggregate analytics (Vercel Analytics and Google Analytics) to understand overall traffic, such as page views and broad device/browser categories. These services do not build a personal profile about you, are not used to identify you, and are not used to serve you targeted ads. We do not use intrusive third-party trackers or fingerprinting scripts.</li>
            <li><strong>Local Storage:</strong> Any preferences (such as your chosen nickname, cigarette style, or volume settings) are stored locally on your device using browser LocalStorage. This data never leaves your device and is never sent to our servers.</li>
            <li><strong>Chat Messages:</strong> When you use the live chat feature in public rooms, your messages are broadcasted to other active users in that room. However, we do not log or store chat history on our servers. Once a message disappears from the screen, it is gone forever.</li>
          </ul>

          <h2>3. Cookies</h2>
          <p>
            PuffBreak itself does not use tracking cookies. The only data we save in your browser is strictly necessary for the application to remember your preferences between visits (e.g., your current "streak" or "high contrast" mode setting), stored in LocalStorage.
          </p>
          <p>
            Our analytics providers may set a cookie to distinguish visits: Vercel Analytics is cookieless by design, while Google Analytics may use a cookie. We do not use advertising cookies.
          </p>

          <h2>4. Third-Party Services</h2>
          <p>
            PuffBreak uses Vercel Analytics and Google Analytics to measure aggregate site traffic. These providers may set a cookie or collect anonymized, aggregated statistics in accordance with their own privacy policies:
          </p>
          <ul>
            <li>Vercel Analytics: <a href="https://vercel.com/docs/analytics/privacy" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300">vercel.com/docs/analytics/privacy</a></li>
            <li>Google Analytics: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300">policies.google.com/privacy</a></li>
          </ul>
          <p>
            PuffBreak may also link to external sites (such as our blog or external resources for smoking cessation). We are not responsible for the privacy practices of those external websites. We encourage you to read their privacy policies.
          </p>

          <h2>5. Children's Privacy</h2>
          <p>
            PuffBreak does not knowingly collect any Personal Identifiable Information from children under the age of 13. While our app is a digital simulator designed to help adults manage stress or quit smoking, we do not track the age of our users as we do not collect any personal data.
          </p>

          <h2>6. Changes to This Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. Since we have no way of contacting you (because we don't ask for your email!), any changes will simply be reflected on this page with an updated revision date.
          </p>

          <h2>7. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at: <a href="mailto:sgbro33@gmail.com" className="text-emerald-400 hover:text-emerald-300">sgbro33@gmail.com</a>
          </p>
        </div>
      </main>
    </div>
  );
}
