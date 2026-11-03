import React, { useState } from 'react';
import { aiService, OpportunitySearchResult } from '../../services/aiService';
import { Button } from '../ui/Button';
import { Sparkles, Search, RefreshCw, X, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AIOpportunitySearchProps {
  onFilterChange: (filters: {
    query?: string;
    category?: string;
    workMode?: string;
    maxBudget?: number | null;
    minBudget?: number | null;
    keywords?: string[];
  }) => void;
  onReset?: () => void;
  className?: string;
}

const QUICK_PROMPTS = [
  'Remote React internships under ₹20,000/mo',
  'Design system freelance projects over ₹5,000',
  'AI startup co-founder with Python & Rust',
  'Video editing short-form gigs with quick delivery',
  'Entry level full-stack roles in Bangalore',
];

export const AIOpportunitySearch: React.FC<AIOpportunitySearchProps> = ({
  onFilterChange,
  onReset,
  className = '',
}) => {
  const [naturalQuery, setNaturalQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [activeIntent, setActiveIntent] = useState<OpportunitySearchResult | null>(null);

  const handleSearch = async (queryText?: string) => {
    const textToSearch = queryText || naturalQuery;
    if (!textToSearch.trim()) return;

    setIsSearching(true);

    try {
      const parsed = await aiService.parseOpportunitySearch(textToSearch);
      setActiveIntent(parsed);

      onFilterChange({
        query: parsed.keywords?.join(' ') || textToSearch,
        category: parsed.category !== 'all' ? parsed.category : undefined,
        workMode: parsed.workMode !== 'any' ? parsed.workMode : undefined,
        maxBudget: parsed.maxBudget,
        minBudget: parsed.minBudget,
        keywords: parsed.keywords,
      });
    } catch {
      // Direct keyword fallback if AI unconfigured
      const basicKeywords = textToSearch.split(/\s+/).filter(w => w.length > 2);
      onFilterChange({
        query: textToSearch,
        keywords: basicKeywords,
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleClear = () => {
    setNaturalQuery('');
    setActiveIntent(null);
    onReset?.();
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="relative">
        <div className="flex items-center gap-2 bg-[#101510] border border-[#273128] focus-within:border-[#B6FF4A]/70 rounded-xs p-1.5 transition-colors">
          <div className="pl-2.5 text-[#B6FF4A]">
            <Sparkles className="w-4 h-4" />
          </div>

          <input
            type="text"
            value={naturalQuery}
            onChange={e => setNaturalQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch();
              }
            }}
            placeholder="Ask HUSTL AI: e.g. 'Remote React internships under ₹20,000/mo'..."
            className="flex-1 bg-transparent px-2 py-1.5 text-xs text-[#F4F7F1] placeholder-[#A0AAA0]/50 focus:outline-none font-mono"
          />

          {naturalQuery && (
            <button
              onClick={handleClear}
              className="p-1.5 text-[#A0AAA0] hover:text-[#F4F7F1] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <Button
            size="sm"
            variant="primary"
            onClick={() => handleSearch()}
            disabled={isSearching || !naturalQuery.trim()}
            className="text-xs font-mono px-3 py-1.5 h-auto shrink-0 flex items-center gap-1.5"
          >
            {isSearching ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span className="hidden sm:inline">Interpreting...</span>
              </>
            ) : (
              <>
                <Search className="w-3.5 h-3.5" />
                <span>Search</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Quick Prompts */}
      <div className="flex items-center gap-1.5 flex-wrap text-[11px] font-mono">
        <span className="text-[#A0AAA0] shrink-0">Try AI prompt:</span>
        {QUICK_PROMPTS.slice(0, 3).map(prompt => (
          <button
            key={prompt}
            type="button"
            onClick={() => {
              setNaturalQuery(prompt);
              handleSearch(prompt);
            }}
            className="px-2 py-0.5 bg-[#141B15] border border-[#273128] hover:border-[#B6FF4A]/40 text-[#A0AAA0] hover:text-[#F4F7F1] rounded-xs transition-colors cursor-pointer truncate max-w-[280px]"
          >
            "{prompt}"
          </button>
        ))}
      </div>

      {/* Active AI Intent Confirmation */}
      <AnimatePresence>
        {activeIntent && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-2.5 bg-[#B6FF4A]/5 border border-[#B6FF4A]/25 rounded-xs flex items-center justify-between gap-3 text-xs font-mono text-[#F4F7F1]"
          >
            <div className="flex items-center gap-2 truncate">
              <Filter className="w-3.5 h-3.5 text-[#B6FF4A] shrink-0" />
              <span className="text-[#B6FF4A] font-semibold">AI Filter Active:</span>
              <span className="truncate text-[#A0AAA0]">{activeIntent.intentExplanation}</span>
            </div>
            <button
              onClick={handleClear}
              className="text-[10px] text-[#A0AAA0] hover:text-[#F4F7F1] underline cursor-pointer shrink-0"
            >
              Reset filter
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
