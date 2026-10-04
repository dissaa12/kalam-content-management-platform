export type AITone = 'Professional' | 'Friendly' | 'Persuasive' | 'Informative' | 'Concise';

export type AIAction =
  | 'generate_headlines'
  | 'generate_meta_description'
  | 'rewrite'
  | 'change_tone'
  | 'summarize'
  | 'social_caption'
  | 'suggest_keywords'
  | 'generate_outline'
  | 'generate_cta'
  | 'readability_analysis';

export interface AIRequestParams {
  action: AIAction;
  content: string;
  tone?: AITone;
  context?: string;
  target_channel?: string;
}

export interface AIResponseData {
  action: AIAction;
  result: string;
  suggestions?: string[];
  readability_metrics?: {
    word_count: number;
    character_count: number;
    sentence_count: number;
    reading_time_minutes: number;
    flesch_reading_ease: number;
    grade_level: string;
  };
  tone_used: string;
  provider_used: string;
}
