// ─── Enumerations ────────────────────────────────────────────────────────────

export type RiskLevel = "low" | "moderate" | "emergency";

export type RedFlagType = "stroke" | "cardiac" | "sepsis";

export type ConditionType =
  | "diabetes"
  | "hypertension"
  | "anemia"
  | "gerd"
  | "ibs"
  | "hypothyroidism";

// ─── Quick Replies ────────────────────────────────────────────────────────────

export interface QuickReply {
  id: string;
  label: string;
  value: string;
}

// ─── Red Flag ─────────────────────────────────────────────────────────────────

export interface RedFlagData {
  type: RedFlagType;
  title: string;
  indicators: string[];
  action: string;
  emergency: boolean;
}

// ─── Condition Card ───────────────────────────────────────────────────────────

export interface SupplementInfo {
  name: string;
  dosage: string;
  note?: string;
}

export interface ConditionData {
  condition: ConditionType;
  title: string;
  icon: string;
  eatMore: string[];
  avoid: string[];
  supplements: SupplementInfo[];
  disclaimer: string;
}

// ─── Suggestion Cards ─────────────────────────────────────────────────────────

export interface TechniqueItem {
  name: string;
  description: string;
  emoji: string;
}

export interface SuggestionCard {
  id: string;
  category: "stress" | "nutrition" | "sleep";
  title: string;
  emoji: string;
  techniques: TechniqueItem[];
}

// ─── Message Content (discriminated union) ────────────────────────────────────

export type MessageContent =
  | { type: "text"; text: string }
  | { type: "quick-replies"; text: string; replies: QuickReply[] }
  | { type: "risk-assessment"; level: RiskLevel; summary: string }
  | { type: "red-flag"; data: RedFlagData }
  | { type: "water-tracker"; target?: number }
  | { type: "condition-card"; data: ConditionData }
  | { type: "suggestion-cards"; intro: string; cards: SuggestionCard[] };

// ─── Chat Message ─────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: "user" | "bot";
  content: MessageContent;
  timestamp: Date;
}

// ─── n8n API contract ─────────────────────────────────────────────────────────

export interface N8nRequest {
  sessionId: string;
  message: string;
  history: Array<{ role: "user" | "bot"; text: string }>;
}

export interface N8nResponse {
  messages: MessageContent[];
}
