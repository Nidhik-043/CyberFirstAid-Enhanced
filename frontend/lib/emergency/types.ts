// CyberFirstAid
// Member 2 - Personalized Cyber Emergency Assistant
// TypeScript interfaces for emergency and recovery APIs

// Supported incident categories
export type IncidentCategory =
  | "financial_fraud"
  | "phishing"
  | "social_media_hacking"
  | "email_compromise"
  | "identity_theft"
  | "online_harassment"
  | "lost_stolen_devices"
  | "unknown";

// Supported questionnaire answers
export type AnswerValue = "yes" | "no" | "unsure";

// Questionnaire answers
export type EmergencyAnswers = Record<string, AnswerValue>;

// Recovery action priority
export type ActionPriority =
  | "immediate"
  | "high"
  | "follow_up";

// Existing incident record
export interface Incident {
  incident_id: number;
  description: string;
  incident_category: IncidentCategory;
  risk_level: string;
  matched_keywords: string[];
  immediate_actions: string[];
  follow_up_actions: string[];
  needs_review: boolean;
  status: string;
  created_at: string;
}

// Incident category information
export interface EmergencyCategory {
  id: IncidentCategory;
  label: string;
}

// Categories API response
export interface CategoriesResponse {
  categories: EmergencyCategory[];
}

// Questionnaire answer option
export interface QuestionOption {
  label: string;
  value: AnswerValue;
}

// Individual emergency question
export interface EmergencyQuestion {
  id: string;
  question: string;
  type: "single_choice";
  options: QuestionOption[];
}

// Questionnaire API response
export interface EmergencyQuestionnaire {
  category: IncidentCategory;
  category_label: string;
  total_questions: number;
  questions: EmergencyQuestion[];
  privacy_notice: string;
}

// Official emergency contact
export interface EmergencyContact {
  id: string;
  name: string;
  phone: string | null;
  url: string | null;
  description: string;
}

// Emergency contacts API response
export interface EmergencyContactsResponse {
  contacts: EmergencyContact[];
}

// Request to generate a personalized recovery plan
export interface EmergencyPlanRequest {
  incident_id: number;
  category: IncidentCategory;
  answers: EmergencyAnswers;
}

// Individual recovery action
export interface RecoveryAction {
  id: string;
  title: string;
  description: string;
  priority: ActionPriority;
  priority_label: string;
  reason: string;
  url: string | null;
  phone: string | null;
  order: number;
  completed: boolean;
  completed_at: string | null;
}

// Actions grouped by priority
export interface GroupedActions {
  immediate: RecoveryAction[];
  high: RecoveryAction[];
  follow_up: RecoveryAction[];
}

// Recovery progress summary
export interface RecoverySummary {
  total_actions: number;
  completed_actions: number;
  pending_actions: number;
  immediate_actions: number;
  high_priority_actions: number;
  follow_up_actions: number;
  progress_percentage: number;
}

// Complete personalized recovery plan
export interface RecoveryPlan {
  plan_id: number;
  incident_id: number;
  incident_status: string;
  risk_level: string;
  category: IncidentCategory;
  category_label: string;
  engine_version: string;
  engine_type: string;
  message: string;
  answers: EmergencyAnswers;
  needs_review: boolean;
  uncertain_answers: string[];
  actions: RecoveryAction[];
  grouped_actions: GroupedActions;
  summary: RecoverySummary;
  emergency_contacts: EmergencyContact[];
  created_at: string;
  updated_at: string;
  disclaimer: string;
}

// Request to update recovery task completion
export interface RecoveryTaskUpdate {
  completed: boolean;
}

// Category display names
export const CATEGORY_LABELS: Record<
  IncidentCategory,
  string
> = {
  financial_fraud: "Financial Fraud",
  phishing: "Phishing Attack",
  social_media_hacking: "Social Media Account Hacking",
  email_compromise: "Email Account Compromise",
  identity_theft: "Identity Theft",
  online_harassment: "Online Harassment",
  lost_stolen_devices: "Lost or Stolen Device",
  unknown: "Unknown Incident",
};

// Priority display names
export const PRIORITY_LABELS: Record<
  ActionPriority,
  string
> = {
  immediate: "Act Immediately",
  high: "Important Action",
  follow_up: "Follow-up Action",
};

// Priority display order
export const PRIORITY_ORDER: ActionPriority[] = [
  "immediate",
  "high",
  "follow_up",
];