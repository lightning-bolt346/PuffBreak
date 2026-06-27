import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | PuffBreak',
  description: 'Read the PuffBreak privacy policy. We believe in complete anonymity and do not track or store your personal data.',
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#0a0a12] text-gray-200 font-display p-6 sm:p-12 selection:bg-emerald-500/30 overflow-x-hidden">
      <div className="max-w-3xl mx-auto mt-16 pb-20">
        <header className="mb-12">
          <Link href="/" className="text-emerald-400 hover:text-emerald-300 text-sm mb-8 inline-block uppercase tracking-widest font-mono-display">
            &larr; Back to Break Room
          </Link>
          
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6 text-white leading-tight">
            Privacy Policy
          </h1>
          <p className="text-gray-400 text-lg">
            Last updated: June 27, 2026
          </p>
        </header>

        <div className="prose prose-invert prose-emerald max-w-none">
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
            <li><strong>No Tracking:</strong> We do not use intrusive third-party trackers or fingerprinting scripts.</li>
            <li><strong>Local Storage:</strong> Any preferences (such as your chosen nickname, cigarette style, or volume settings) are stored locally on your device using browser LocalStorage. This data never leaves your device and is never sent to our servers.</li>
            <li><strong>Chat Messages:</strong> When you use the live chat feature in public rooms, your messages are broadcasted to other active users in that room. However, we do not log or store chat history on our servers. Once a message disappears from the screen, it is gone forever.</li>
          </ul>

          <h2>3. Cookies</h2>
          <p>
            We do not use tracking cookies. The only data saved in your browser is strictly necessary for the application to remember your preferences between visits (e.g., your current "streak" or "high contrast" mode setting).
          </p>

          <h2>4. Third-Party Services</h2>
          <p>
            PuffBreak may link to external sites (such as our blog or external resources for smoking cessation). We are not responsible for the privacy practices of those external websites. We encourage you to read their privacy policies.
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
            If you have any questions about this Privacy Policy, please contact us at: <a href="mailto:hello@damta.world" className="text-emerald-400 hover:text-emerald-300">hello@damta.world</a>
          </p>
        </div>
      </div>
    </div>
  );
}
