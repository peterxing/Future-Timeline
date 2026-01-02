import { type InsertTimelineEvent, type TimelineEvent } from "@shared/schema";
import { apiRequest } from "./queryClient";

export async function fetchEvents(): Promise<TimelineEvent[]> {
  const res = await apiRequest("GET", "/api/events");
  return res.json();
}

export async function updateEvent(
  id: string,
  updates: Partial<TimelineEvent>,
): Promise<TimelineEvent> {
  const res = await apiRequest("PUT", `/api/events/${id}`, updates);
  return res.json();
}

export async function importEvents(
  events: InsertTimelineEvent[],
): Promise<TimelineEvent[]> {
  const res = await apiRequest("POST", "/api/events/import", { events });
  return res.json();
}

export async function resetEvents(): Promise<TimelineEvent[]> {
  const res = await apiRequest("POST", "/api/events/reset");
  return res.json();
}
