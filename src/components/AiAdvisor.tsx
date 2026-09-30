import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  RefreshCw, 
  TrendingUp, 
  Coins,
  Copy,
  Check,
  RotateCcw,
  ShieldCheck,
  ArrowRight,
  Calculator
} from 'lucide-react';
import { Language, MarketIntelligence, ChatMessage, ChatAction } from '../types';
import { toBengaliNumber } from '../utils/translations';

interface AiAdvisorProps {
  lang: Language;
  marketData: MarketIntelligence | null;
  onRefreshMarketData: () => void;
  isLoadingMarketData: boolean;
  onOpenBookingModal: () => void;
}

export const AiAdvisor: React.FC<AiAdvisorProps> = ({
  lang,
  marketData,
  onRefreshMarketData,
  isLoadingMarketData,
  onOpenBookingModal,
}) => {
  const initialGreeting: ChatMessage = {
    id: 'initial',
    sender: 'ai',
    text: lang === 'bn'
      ? `স্বাগতম! আমি Tk-Shield AI স্ট্র্যাটেজিস্ট।
মুদ্রাস্ফীতি রোধ, ব্যাংক ডিপিএস বনাম রূপা, কিংবা আপনার বাজেট অনুযায়ী সঞ্চয় পরিকল্পনা নিয়ে যেকোনো প্রশ্ন করতে পারেন।`
      : `Welcome! I am the Tk-Shield AI Wealth Strategist.
Ask any questions regarding inflation hedging, bank deposits vs silver, or personalized savings targets.`,
    timestamp: Date.now(),
    action: {
      type: 'book',
      labelBn: 'সিলভার কিনেন-এ সঞ্চয় শুরু করুন',
      labelEn: 'Start Saving on Silver Kinen',
      amount: 1000,
    },
  };

  const [messages, setMessages] = useState<ChatMessage[]>([initialGreeting]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Smoothly scroll the chat container to the target message without jumping the browser window
  const scrollToTurn = (messageId: string) => {
    setTimeout(() => {
      const container = chatContainerRef.current;
      if (!container) return;

      const targetEl = container.querySelector<HTMLElement>(`[data-message-id="${messageId}"]`);
      if (!targetEl) return;

      const containerRect = container.getBoundingClientRect();
      const targetRect = targetEl.getBoundingClientRect();
      const relativeTop = targetRect.top - containerRect.top + container.scrollTop;

      // Align question / start of answer cleanly at the top of the chat area
      container.scrollTo({
        top: Math.max(0, relativeTop - 8),
        behavior: 'smooth',
      });
    }, 60);
  };

  const quickTopics = lang === 'bn' ? [
    { label: '⚖️ ব্যাংক ডিপিএস বনাম রূপা', q: 'ব্যাংকে ডিপিএস নাকি রূপায় জমানো বেশি লাভজনক?' },
    { label: '🪙 সোনা নাকি রূপা?', q: 'সোনা নাকি রূপা — কোনটা কেনা বেশি বুদ্ধিমানের কাজ?' },
    { label: '🔄 শতভাগ বাই-ব্যাক গ্যারান্টি', q: 'সিলভার কিনেন-এ রূপা বিক্রি (Buyback) এবং ডেলিভারির নিয়ম কী?' },
    { label: '🌾 সিলভার গ্রেইনের সুবিধা', q: 'গহনা বা অলংকারের বদলে ৯৯৯ সিলভার গ্রেইন কেন সেরা পছন্দ?' },
    { label: '🕌 হালাল ও জাকাত হিসাব', q: 'রূপা সঞ্চয় কি হালাল এবং জাকাতের হিসাব কীভাবে করব?' },
    { label: '🧮 ৳৫,০০০ মাসিক সঞ্চয় প্ল্যান', q: 'প্রতি মাসে ৫,০০০ টাকা সঞ্চয় করলে সিলভার কিনেন-এ রূপার হিসাব কী হবে?' },
  ] : [
    { label: '⚖️ Bank DPS vs Silver', q: 'Silver vs Bank Savings: which beats inflation better in Bangladesh?' },
    { label: '🪙 Gold vs Silver Ratio', q: 'Gold vs Silver: which is a smarter investment right now?' },
    { label: '🔄 Guaranteed Buyback', q: 'How does Silver Kinen buyback & nationwide delivery work?' },
    { label: '🌾 Why Silver Grain?', q: 'Why is 999 investment-grade silver grain better than traditional jewelry?' },
    { label: '🕌 Halal & Zakat Rules', q: 'Is silver bullion halal and how is Zakat calculated on silver?' },
    { label: '🧮 ৳5,000 Monthly Plan', q: 'What is the projected outcome of saving ৳5,000 monthly in Silver Kinen?' },
  ];

  const handleAsk = async (questionText: string) => {
    const q = questionText.trim();
    if (!q || isAsking) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setIsAsking(true);
    scrollToTurn(userMsg.id);

    try {
      // Build conversation history turns for true LLM context
      const historyTurns = messages
        .filter((m) => m.id !== 'initial')
        .slice(-6)
        .map((m) => ({
          role: m.sender === 'user' ? 'user' : 'model',
          text: m.text,
        }));

      const res = await fetch('/api/ai-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          history: historyTurns,
          lang,
        }),
      });

      const data = await res.json();
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.answer || (lang === 'bn' ? 'দুঃখিত, তথ্য লোড করতে সমস্যা হয়েছে।' : 'Failed to retrieve information.'),
        timestamp: Date.now(),
        action: data.suggestedAction,
      };

      setMessages((prev) => [...prev, aiMsg]);
      scrollToTurn(userMsg.id);
    } catch {
      const fallbackMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: lang === 'bn'
          ? '৯৯৯ খাঁটি রূপা হলো ৫,০০০ বছরের পরীক্ষিত সম্পদ যা মুদ্রাস্ফীতি রোধ করে। সিলভার কিনেন (silverkinen.com)-এ মাত্র ৳৪৫২/গ্রামে আপনি সঞ্চয় শুরু করতে পারেন।'
          : '999 fine silver is a proven tangible store of value. Accumulate certified physical silver grain from ৳452/g on silverkinen.com.',
        timestamp: Date.now(),
        action: {
          type: 'book',
          labelBn: 'সিলভার গ্রেইন বুক করুন',
          labelEn: 'Lock In Silver Grain',
        },
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      scrollToTurn(userMsg.id);
    } finally {
      setIsAsking(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    setMessages([initialGreeting]);
  };

  // Format inline bold styling and highlights
  const formatInline = (content: string) => {
    const parts = content.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-bold text-silver-bright">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  // Custom lightweight, zero-dependency Markdown renderer
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('### ')) {
        return (
          <h4 key={idx} className="font-bold text-xs sm:text-sm text-silver-bright mt-2 mb-1 font-display flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-light shrink-0" />
            <span>{trimmed.replace('### ', '')}</span>
          </h4>
        );
      }
      if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
        const bullet = trimmed.replace(/^[-•]\s*/, '');
        return (
          <div key={idx} className="flex items-start gap-2 my-1 pl-1 text-xs sm:text-sm leading-relaxed">
            <span className="text-blue-light font-bold text-xs select-none mt-0.5">•</span>
            <span className="flex-1 text-foreground">{formatInline(bullet)}</span>
          </div>
        );
      }
      const numMatch = trimmed.match(/^([0-9]+)\.\s*(.*)/);
      if (numMatch) {
        return (
          <div key={idx} className="flex items-start gap-2 my-1 pl-1 text-xs sm:text-sm leading-relaxed">
            <span className="text-blue-light font-bold text-xs select-none font-display mt-0.5">{numMatch[1]}.</span>
            <span className="flex-1 text-foreground">{formatInline(numMatch[2])}</span>
          </div>
        );
      }
      if (trimmed === '') {
        return <div key={idx} className="h-1.5" />;
      }
      return (
        <p key={idx} className="my-0.5 text-xs sm:text-sm leading-relaxed text-foreground">
          {formatInline(line)}
        </p>
      );
    });
  };

  return (
    <div className="space-y-5 animate-fade-in font-body">
      {/* Live Accurate Market Intelligence Header Card */}
      <div className="nm-hero-card p-5 sm:p-6 shadow-premium relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary text-silver-bright border border-border">
              <Sparkles className="w-5 h-5 text-blue-light" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-display silver-text">
                {lang === 'bn' ? 'লাইভ বাজার ও অর্থনৈতিক তথ্য' : 'Live Market Benchmarks'}
              </h2>
              <p className="text-xs text-muted-foreground font-body">
                {lang === 'bn' ? 'সিলভার কিনেন ও বাংলাদেশ ব্যুরো অব স্ট্যাটিস্টিকস (BBS)' : 'BBS Economic Indicators & Bullion Rates'}
              </p>
            </div>
          </div>

          <button
            onClick={onRefreshMarketData}
            disabled={isLoadingMarketData}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-xs font-medium text-foreground border border-border transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-light ${isLoadingMarketData ? 'animate-spin' : ''}`} />
            <span>{isLoadingMarketData ? (lang === 'bn' ? 'হালনাগাদ হচ্ছে...' : 'Updating...') : (lang === 'bn' ? 'রিফ্রেশ' : 'Refresh')}</span>
          </button>
        </div>

        {/* Live Rates Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-4">
          <div className="p-3 rounded-lg glass-card border border-border">
            <div className="text-[11px] text-muted-foreground mb-1 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-silver" />
              <span>{lang === 'bn' ? 'রূপা (প্রতি গ্রাম)' : 'Silver / Gram'}</span>
            </div>
            <div className="text-lg font-display font-bold silver-text">
              ৳{lang === 'bn' ? toBengaliNumber(marketData?.silverPricePerGram || 452) : (marketData?.silverPricePerGram || 452)}
            </div>
            <div className="text-[10px] text-success font-semibold">
              {lang === 'bn' ? '৯৯৯ খাঁটি রূপা' : '999 Pure Fine'}
            </div>
          </div>

          <div className="p-3 rounded-lg glass-card border border-border">
            <div className="text-[11px] text-muted-foreground mb-1 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-blue-light" />
              <span>{lang === 'bn' ? '১ ভরি রূপা (১১.৬৬ গ্রাম)' : '1 Vori (11.66g)'}</span>
            </div>
            <div className="text-lg font-display font-bold text-silver-bright">
              ৳{lang === 'bn' ? toBengaliNumber(marketData?.silverPricePerVori || marketData?.silverPricePerTola || 5276) : (marketData?.silverPricePerVori || marketData?.silverPricePerTola || 5276)}
            </div>
            <div className="text-[10px] text-muted-foreground">
              {lang === 'bn' ? 'ঢাকা স্ট্যান্ডার্ড' : 'Dhaka Standard'}
            </div>
          </div>

          <div className="p-3 rounded-lg glass-card border border-border">
            <div className="text-[11px] text-muted-foreground mb-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-blue-light" />
              <span>{lang === 'bn' ? 'সরকারি মূল্যস্ফীতি' : 'CPI Inflation'}</span>
            </div>
            <div className="text-lg font-display font-bold text-silver-bright">
              {lang === 'bn' ? toBengaliNumber(marketData?.cpiInflationRate || 8.5) : (marketData?.cpiInflationRate || 8.5)}%
            </div>
            <div className="text-[10px] text-muted-foreground">
              {lang === 'bn' ? 'বিবিএস সরকারি হার' : 'Official BBS Rate'}
            </div>
          </div>

          <div className="p-3 rounded-lg glass-card border border-border">
            <div className="text-[11px] text-muted-foreground mb-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-destructive" />
              <span>{lang === 'bn' ? 'খাদ্য মূল্যস্ফীতি' : 'Food Inflation'}</span>
            </div>
            <div className="text-lg font-display font-bold text-destructive">
              {lang === 'bn' ? toBengaliNumber(marketData?.foodInflationRate || 11.5) : (marketData?.foodInflationRate || 11.5)}%
            </div>
            <div className="text-[10px] text-muted-foreground">
              {lang === 'bn' ? 'ভোক্তা সূচক' : 'Consumer Index'}
            </div>
          </div>
        </div>

        <p className="text-xs text-foreground font-body leading-relaxed glass-card p-3 rounded-lg border border-border">
          {lang === 'bn' ? marketData?.marketSummaryBn : marketData?.marketSummaryEn}
        </p>
      </div>

      {/* Interactive AI Chat & Advisor */}
      <div className="glass-card p-4 sm:p-5 shadow-premium space-y-4">
        {/* Chat Header with Status and Reset */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-8 h-8 rounded-lg bg-blue-cta text-white flex items-center justify-center font-bold">
                <Bot className="w-4 h-4" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-background" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-foreground font-display flex items-center gap-1.5">
                <span>{lang === 'bn' ? 'Tk-Shield এআই ফাইন্যান্সিয়াল অ্যাডভাইজার' : 'Tk-Shield AI Wealth Advisor'}</span>
              </h3>
              <p className="text-[11px] text-muted-foreground">
                {lang === 'bn' ? 'Silver Kinen অফিসিয়াল কৌশল ও মার্কেট অ্যানালিটিক্স' : 'Powered by Silver Kinen Intelligence'}
              </p>
            </div>
          </div>

          {messages.length > 1 && (
            <button
              onClick={handleResetChat}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded bg-secondary border border-border cursor-pointer transition-colors"
              title={lang === 'bn' ? 'নতুন চ্যাট শুরু করুন' : 'Start fresh conversation'}
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">{lang === 'bn' ? 'নতুন চ্যাট' : 'New Chat'}</span>
            </button>
          )}
        </div>

        {/* Quick Topic Chips */}
        <div>
          <div className="text-[11px] text-muted-foreground font-semibold mb-2">
            {lang === 'bn' ? 'জনপ্রিয় আর্থিক পরামর্শ ও বিশ্লেষণ:' : 'Popular Financial Insights & Analyses:'}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {quickTopics.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAsk(item.q)}
                disabled={isAsking}
                className="text-xs px-3 py-1.5 rounded-lg bg-secondary border border-border text-foreground hover:bg-secondary/80 hover:text-white transition-all font-body text-left cursor-pointer disabled:opacity-50 flex items-center gap-1"
              >
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Message Thread */}
        <div 
          ref={chatContainerRef}
          className="space-y-4 max-h-[480px] overflow-y-auto pr-1 sm:pr-2 scroll-smooth"
        >
          {messages.map((m) => (
            <div
              key={m.id}
              data-message-id={m.id}
              className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'ai' && (
                <div className="w-7 h-7 rounded-lg bg-secondary border border-border text-blue-light flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`p-3.5 sm:p-4 rounded-xl max-w-[90%] sm:max-w-[82%] relative group transition-all ${
                  m.sender === 'user'
                    ? 'bg-blue-cta text-white rounded-tr-none shadow-sm'
                    : 'bg-card border border-border text-foreground rounded-tl-none shadow-sm'
                }`}
              >
                {/* AI Markdown formatting */}
                {m.sender === 'ai' ? (
                  <div className="space-y-1">
                    {renderMarkdown(m.text)}

                    {/* Interactive Suggested Actionable Card */}
                    {m.action && (
                      <div className="mt-3.5 pt-3 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                          <Coins className="w-3.5 h-3.5 text-blue-light" />
                          <span>
                            {lang === 'bn'
                              ? 'Silver Kinen-এ সরাসরি সিলভার গ্রেইন বুক করুন:'
                              : 'Lock in on Silver Kinen now:'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={onOpenBookingModal}
                          className="px-3.5 py-1.5 rounded-lg bg-blue-cta hover:bg-blue-cta/90 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 cursor-pointer transition-transform hover:scale-[1.02]"
                        >
                          <span>{lang === 'bn' ? m.action.labelBn : m.action.labelEn}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs sm:text-sm font-body leading-relaxed whitespace-pre-wrap">
                    {m.text}
                  </div>
                )}

                {/* Copy message button */}
                {m.sender === 'ai' && (
                  <button
                    type="button"
                    onClick={() => handleCopy(m.id, m.text)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground text-xs"
                    title={lang === 'bn' ? 'উত্তর কপি করুন' : 'Copy answer'}
                  >
                    {copiedId === m.id ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                )}
              </div>

              {m.sender === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-secondary text-silver flex items-center justify-center shrink-0 mt-0.5 border border-border">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isAsking && (
            <div className="flex items-center gap-2.5 text-xs text-muted-foreground font-body p-3 rounded-xl bg-card border border-border max-w-sm">
              <Loader2 className="w-4 h-4 text-blue-light animate-spin" />
              <span>
                {lang === 'bn'
                  ? 'Gemini AI তথ্য বিশ্লেষণ ও গাণিতিক হিসেব করছে...'
                  : 'Gemini is running macroeconomic calculations...'}
              </span>
            </div>
          )}
        </div>

        {/* Question Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk(inputQuestion);
          }}
          className="flex items-center gap-2 pt-2"
        >
          <input
            type="text"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            placeholder={
              lang === 'bn'
                ? 'ডিপিএস, সোনা বনাম রূপা বা নির্দিষ্ট বাজেট লিখে প্রশ্ন করুন...'
                : 'Ask about DPS, Gold vs Silver, or type a custom budget...'
            }
            className="flex-1 px-4 py-3 rounded-lg bg-input border border-border focus:border-blue-cta focus:ring-1 focus:ring-ring text-foreground text-xs sm:text-sm outline-none placeholder:text-muted-foreground font-body shadow-inner"
          />
          <button
            type="submit"
            disabled={!inputQuestion.trim() || isAsking}
            className="p-3 rounded-lg bg-blue-cta hover:bg-blue-cta/90 text-white font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Book on Silver Kinen Banner */}
      <div className="promo-pill p-4 sm:p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-border bg-gradient-to-r from-secondary/80 to-secondary">
        <div>
          <div className="text-xs sm:text-sm font-bold text-foreground font-display flex items-center gap-2">
            <Coins className="w-4 h-4 text-blue-light" />
            <span>{lang === 'bn' ? 'সিলভার কিনেন-এ সরাসরি ৯৯৯ সিলভার গ্রেইন লক ইন করুন' : 'Lock In Physical 999 Silver Grain on Silver Kinen'}</span>
          </div>
          <div className="text-[11px] sm:text-xs text-muted-foreground font-body mt-0.5">
            {lang === 'bn'
              ? 'সারাদেশে ৬৪ জেলায় হোম ডেলিভারি • বিকাশ/নগদ/কার্ড • শতভাগ বাই-ব্যাক গ্যারান্টি'
              : 'Delivery across 64 districts • bKash/Nagad/Cards • 100% Guaranteed Buyback'}
          </div>
        </div>
        <button
          onClick={onOpenBookingModal}
          className="shrink-0 px-5 py-2.5 rounded-lg bg-blue-cta hover:bg-blue-cta/90 text-white font-bold text-xs shadow-sm cursor-pointer transition-transform hover:scale-[1.02] flex items-center justify-center gap-1.5"
        >
          <span>{lang === 'bn' ? 'সিলভার গ্রেইন বুক করুন' : 'Book Silver Grain'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
