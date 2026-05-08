/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, RefreshCw } from "lucide-react";
import { STATIC_QUOTES } from "../constants/quotes";

export default function Quote() {
  const [quote, setQuote] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * STATIC_QUOTES.length);
    return STATIC_QUOTES[randomIndex];
  };

  const refreshQuote = () => {
    setIsRefreshing(true);
    const newQuote = getRandomQuote();
    // Use a small timeout to make the transition feel intentional
    setTimeout(() => {
      setQuote(newQuote);
      setIsRefreshing(false);
    }, 300);
  };

  useEffect(() => {
    const lastQuoteDate = localStorage.getItem('daybreak_last_quote_date');
    const today = new Date().toDateString();
    const storedQuote = localStorage.getItem('daybreak_daily_quote');

    if (lastQuoteDate === today && storedQuote) {
      setQuote(storedQuote);
    } else {
      const initialQuote = getRandomQuote();
      setQuote(initialQuote);
      localStorage.setItem('daybreak_last_quote_date', today);
      localStorage.setItem('daybreak_daily_quote', initialQuote);
    }
  }, []);

  // Update storage when quote changes
  useEffect(() => {
    if (quote) {
      localStorage.setItem('daybreak_daily_quote', quote);
    }
  }, [quote]);

  return (
    <div className="relative group p-10 theme-card overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={quote}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="relative z-10"
        >
          <Sparkles className="w-8 h-8 text-brand-accent mb-6" />
          <p className="text-2xl font-light leading-relaxed italic text-zinc-700 dark:text-white/80">
            "{quote || '...'}"
          </p>
          <div className="mt-6 flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.2em] text-brand-accent font-bold">Daily Spark</span>
            <button 
              onClick={refreshQuote}
              disabled={isRefreshing}
              className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-brand-accent transition-colors disabled:opacity-50"
              title="New quote"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
      
      <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.03] pointer-events-none -mr-8 -mt-8">
        <Sparkles className="w-full h-full text-zinc-500 dark:text-white" />
      </div>
    </div>
  );
}
