import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { ArrowLeft, Coffee, Heart } from 'lucide-react';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn about the story behind PuffBreak, the solo developer building it, and why we believe in the power of the 3-minute digital break.',
  alternates: {
    canonical: `${SITE_URL}/about`,
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-200 font-display relative overflow-x-hidden selection:bg-emerald-500/20">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-white/[0.06] bg-[#0a0a0f]/80 backdrop-blur-xl">
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

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 pt-20 pb-32 relative z-10">
        <div className="text-center mb-16">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Coffee className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6 tracking-tight">About PuffBreak</h1>
          <p className="text-gray-400 text-xl leading-relaxed max-w-2xl mx-auto font-light">
            Building a space for mindful digital breaks in an always-connected world.
          </p>
        </div>

        <div className="prose prose-invert prose-emerald max-w-none prose-lg
                        prose-headings:text-white prose-headings:font-bold prose-headings:tracking-tight
                        prose-p:text-gray-300 prose-p:leading-relaxed
                        prose-a:text-emerald-400 hover:prose-a:text-emerald-300">
          
          <h2 className="text-3xl mt-16 mb-8">The Story</h2>
          <p>
            PuffBreak started from a simple observation: modern work doesn't give us time to breathe. 
            Historically, people took "smoke breaks" or "chai breaks" — a guaranteed 3 to 5 minutes to step outside, 
            disconnect from the screen, and reset their mind. 
          </p>
          <p>
            But if you don't smoke, or if you work remotely from your bedroom, you often lose that built-in excuse to pause. 
            You end up scrolling through social media, which isn't a break at all. It's just a different kind of noise.
          </p>
          <p>
            I built PuffBreak to bring the <em>ritual</em> of the break back into our digital lives. 
            Whether you're using it to cut down on nicotine cravings by replacing the physical habit with a digital one, 
            or you just need 3 minutes of rain, a quiet room, or a carefully chosen music station, this space is for you.
          </p>

          <h2 className="text-3xl mt-16 mb-8">Who is Behind PuffBreak?</h2>
          <p>
            PuffBreak is built and maintained by one independent maker — no venture capital, no marketing team,
            and no data brokering. Just a laptop, a strong belief that everyone deserves a real 3-minute break,
            and an unhealthy amount of chai.
          </p>
          <p>
            The project stays deliberately small and honest: free forever, anonymous by design, and funded
            entirely by the community that uses it.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-12 not-prose">
            <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.02] text-center">
              <div className="text-2xl font-bold text-emerald-400">8</div>
              <div className="text-[11px] text-gray-500 uppercase tracking-widest mt-1">Ambient Rooms</div>
            </div>
            <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.02] text-center">
              <div className="text-2xl font-bold text-amber-400">3</div>
              <div className="text-[11px] text-gray-500 uppercase tracking-widest mt-1">Minute Ritual</div>
            </div>
            <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.02] text-center">
              <div className="text-2xl font-bold text-sky-400">40+</div>
              <div className="text-[11px] text-gray-500 uppercase tracking-widest mt-1">Music Stations</div>
            </div>
          </div>

          <h2 className="text-3xl mt-16 mb-8">The Privacy Promise</h2>
          <p>
            Because PuffBreak is independent, I don't need to harvest your data to satisfy shareholders. 
            <strong>PuffBreak collects zero personal information.</strong> 
            There are no logins, personal profiles, ad targeting, or permanent chat histories.
            Preferences such as your break streak, sound levels, and saved stations live in your browser. PuffBreak uses aggregate traffic analytics, temporary room messages, and anonymous counters as described in the <Link href="/privacy">privacy policy</Link>.
          </p>

          <h2 className="text-3xl mt-16 mb-8">How to Support</h2>
          <p>
            PuffBreak is 100% free and always will be. The servers are funded entirely out of pocket and through the generosity of the community. 
            If you want to help keep the lights on and the virtual chai hot, you can <Link href="/support">support the project here</Link>.
          </p>

          <div className="mt-10 not-prose p-6 sm:p-8 rounded-2xl border border-amber-400/20 bg-gradient-to-br from-amber-400/[0.07] to-transparent flex flex-col sm:flex-row items-center gap-6">
            <div className="flex-1 text-center sm:text-left">
              <p className="text-white font-semibold text-lg mb-1">Enjoying the break room?</p>
              <p className="text-sm text-gray-400 leading-relaxed">
                PuffBreak is free, ad-free, and community-funded. If it has saved you even one cigarette or one
                meltdown, consider buying a virtual chai to keep it running.
              </p>
            </div>
            <Link
              href="/support"
              className="shrink-0 inline-flex items-center gap-2 bg-amber-400 text-black font-bold px-6 py-3 rounded-full hover:bg-amber-300 transition-all hover:scale-105 active:scale-95"
            >
              ☕ Buy me a chai
            </Link>
          </div>

          <div className="mt-16 p-6 border border-white/10 rounded-2xl bg-white/[0.02] text-sm text-gray-400 flex items-start gap-4">
            <span className="text-2xl mt-1">ℹ️</span>
            <p className="m-0">
              <strong>Medical Disclaimer:</strong> PuffBreak is a simulation tool designed for entertainment, stress relief, and habit substitution. 
              It is <strong>not</strong> a medical device or a clinically proven smoking cessation program. 
              If you are struggling with nicotine addiction, please consult a healthcare professional.
            </p>
          </div>
        </div>

        <div className="mt-24 text-center text-gray-500 text-sm flex items-center justify-center gap-2">
          Made with <Heart className="w-4 h-4 text-emerald-500/70" /> and too much chai — somewhere between meetings.
        </div>
      </main>
    </div>
  );
}
