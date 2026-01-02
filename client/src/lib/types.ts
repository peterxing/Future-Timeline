export type Category = 
  | "AI & Robotics"
  | "Science & Technology"
  | "Society & Policy"
  | "Society & Culture"
  | "Space"
  | "Environment"
  | "Other";

export type Region = "Global" | "USA" | "EU" | "China" | "India" | "Africa" | "Other";

export type Probability = "Low" | "Medium" | "High";

export interface TimelineEvent {
  id: string;
  title: string;
  startMonth: string; // YYYY-MM
  endMonth?: string; // YYYY-MM
  category: Category;
  region: Region;
  suggestedProb: number; // 0-100
  yourProb: number; // 0-100
  effectiveProb: number; // calculated (usually average or override)
  description: string;
  rationale?: string;
  planningPrompts?: string;
  sources: { title: string; url: string }[];
  notes?: string;
}

export interface TimelineState {
  events: TimelineEvent[];
  filters: {
    categories: Category[];
    search: string;
    minProb: number;
    regions: Region[];
  };
  displayMode: "range" | "start-only";
  selectedEventId: string | null;
}
