import type {
  Category,
  InsertTimelineEvent,
  Region,
  TimelineEvent,
} from "@shared/schema";

export type { Category, Region, TimelineEvent, InsertTimelineEvent };

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
