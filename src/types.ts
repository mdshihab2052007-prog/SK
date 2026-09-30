export type Language = 'bn' | 'en';

export interface SavingEntry {
  id: string;
  amount: number;
  note: string;
  category: string;
  timestamp: number;
  silverGrams: number;
}

export type TabType = 'calculator' | 'saver' | 'vault' | 'advisor' | 'about';

export interface Milestone {
  id: string;
  targetGrams: number;
  titleBn: string;
  titleEn: string;
  descBn: string;
  descEn: string;
  badgeBn: string;
  badgeEn: string;
  iconName: string;
}

export interface MarketIntelligence {
  silverPricePerGram: number;
  silverPricePerVori?: number;
  silverPricePerTola?: number;
  cpiInflationRate: number;
  foodInflationRate: number;
  lastUpdated: string;
  source: string;
  marketSummaryBn: string;
  marketSummaryEn: string;
  aiGrounded?: boolean;
}

export interface ChatAction {
  type: 'book' | 'calculator' | 'preset';
  labelBn: string;
  labelEn: string;
  amount?: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: number;
  action?: ChatAction;
}
