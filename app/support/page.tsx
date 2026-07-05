'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Copy, QrCode, ArrowLeft, Heart } from 'lucide-react';

export default function SupportPage() {
  const [openQr, setOpenQr] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-200 font-display relative overflow-x-hidden selection:bg-amber-400/20">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-amber-400/5 blur-[120px] rounded-full pointer-events-none" />

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
      <main className="max-w-2xl mx-auto px-6 pt-20 pb-32 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <div className="w-16 h-16 bg-amber-400/10 border border-amber-400/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Star className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6 tracking-tight">Keep PuffBreak Free</h1>
          <p className="text-gray-400 text-lg leading-relaxed max-w-xl mx-auto">
            PuffBreak is built by a solo developer. No ads, no paywalls, no corporate tracking. If you enjoy your 3-minute breaks here, consider fueling the servers (and my coffee habit).
          </p>
        </motion.div>

        <div className="space-y-6">
          {/* Crypto Option */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-6 sm:p-8 hover:bg-white/[0.05] transition-colors relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="text-8xl font-bold text-orange-400">₿</span>
            </div>
            <h3 className="text-sm font-mono text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span> Bitcoin (BTC)
            </h3>
            
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between bg-black/50 border border-white/[0.06] p-4 rounded-xl relative z-10">
                <div className="flex items-center gap-3 overflow-hidden">
                  <span className="text-gray-300 font-mono text-sm sm:text-base truncate select-all">bc1q7rdc229skeumz0tfecmqnajhkw9s97ttrl0hgq</span>
                </div>
                <div className="flex shrink-0 items-center gap-2 ml-4">
                  <button 
                    onClick={() => handleCopy('bc1q7rdc229skeumz0tfecmqnajhkw9s97ttrl0hgq', 'btc')} 
                    className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                    title="Copy Address"
                  >
                    {copied === 'btc' ? <span className="text-emerald-400 text-xs font-bold">Copied!</span> : <Copy className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={() => setOpenQr(openQr === 'btc' ? null : 'btc')} 
                    className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all ${openQr === 'btc' ? 'bg-orange-500/20 text-orange-400' : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white'}`}
                    title="Show QR Code"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {openQr === 'btc' && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }} 
                    animate={{ height: 'auto', opacity: 1 }} 
                    exit={{ height: 0, opacity: 0 }} 
                    className="overflow-hidden flex justify-center w-full relative z-10"
                  >
                    <div className="bg-white p-4 rounded-2xl mt-2 flex flex-col items-center gap-3 w-full sm:w-auto">
                      <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=bitcoin:bc1q7rdc229skeumz0tfecmqnajhkw9s97ttrl0hgq&bgcolor=255-255-255" alt="BTC QR" className="w-[180px] h-[180px] rounded-lg" />
                      <span className="text-gray-500 text-xs font-mono font-medium">Scan with any Bitcoin wallet</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* UPI Option */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-6 sm:p-8 hover:bg-white/[0.05] transition-colors relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <span className="text-8xl font-bold text-emerald-400">₹</span>
            </div>
            <h3 className="text-sm font-mono text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span> UPI (India)
            </h3>
            
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between bg-black/50 border border-white/[0.06] p-4 rounded-xl relative z-10">
                <div className="flex items-center gap-3 overflow-hidden">
                  <span className="text-gray-300 font-mono text-sm sm:text-base truncate select-all">sgbro33@okicici</span>
                </div>
                <div className="flex shrink-0 items-center gap-2 ml-4">
                  <button 
                    onClick={() => handleCopy('sgbro33@okicici', 'upi')} 
                    className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                    title="Copy UPI ID"
                  >
                    {copied === 'upi' ? <span className="text-emerald-400 text-xs font-bold">Copied!</span> : <Copy className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={() => setOpenQr(openQr === 'upi' ? null : 'upi')} 
                    className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all ${openQr === 'upi' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white'}`}
                    title="Show QR Code"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Direct UPI deep link for mobile */}
              <a 
                href="upi://pay?pa=sgbro33@okicici&pn=PuffBreak&cu=INR" 
                className="w-full py-3 sm:hidden bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-emerald-500/20 active:scale-[0.98] transition-all relative z-10"
              >
                Pay with UPI App
              </a>

              <AnimatePresence>
                {openQr === 'upi' && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }} 
                    animate={{ height: 'auto', opacity: 1 }} 
                    exit={{ height: 0, opacity: 0 }} 
                    className="overflow-hidden flex justify-center w-full relative z-10"
                  >
                    <div className="bg-white p-4 rounded-2xl mt-2 flex flex-col items-center gap-3 w-full sm:w-auto">
                      <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=sgbro33@okicici&pn=PuffBreak&cu=INR&bgcolor=255-255-255" alt="UPI QR" className="w-[180px] h-[180px] rounded-lg" />
                      <span className="text-gray-500 text-xs font-mono font-medium">Scan with GPay, PhonePe, Paytm</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-16 text-center text-gray-500 text-sm flex items-center justify-center gap-2"
        >
          Made with <Heart className="w-4 h-4 text-red-500/70" /> for the community.
        </motion.div>
      </main>
    </div>
  );
}
