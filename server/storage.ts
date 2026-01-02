import {
  type InsertTimelineEvent,
  type InsertUser,
  type TimelineEvent,
  type User,
  insertTimelineEventSchema,
  insertUserSchema,
  timelineEvents,
  updateTimelineEventSchema,
  users,
} from "@shared/schema";
import { db } from "./db";
import { DEFAULT_EVENTS } from "@shared/mockData";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  listEvents(): Promise<TimelineEvent[]>;
  createEvent(event: InsertTimelineEvent): Promise<TimelineEvent>;
  updateEvent(id: string, updates: Partial<InsertTimelineEvent>): Promise<TimelineEvent | undefined>;
  deleteEvent(id: string): Promise<void>;
  replaceEvents(events: InsertTimelineEvent[]): Promise<TimelineEvent[]>;
  seedDefaults(): Promise<void>;
}

export class PgStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const parsed = insertUserSchema.parse(user);
    const [created] = await db.insert(users).values(parsed).returning();
    return created;
  }

  async listEvents(): Promise<TimelineEvent[]> {
    return db.select().from(timelineEvents).orderBy(timelineEvents.startMonth);
  }

  async createEvent(event: InsertTimelineEvent): Promise<TimelineEvent> {
    const parsed = insertTimelineEventSchema.parse(event);
    const [created] = await db.insert(timelineEvents).values(parsed).returning();
    return created;
  }

  async updateEvent(
    id: string,
    updates: Partial<InsertTimelineEvent>,
  ): Promise<TimelineEvent | undefined> {
    const parsed = updateTimelineEventSchema.parse(updates);
    const [updated] = await db
      .update(timelineEvents)
      .set(parsed)
      .where(eq(timelineEvents.id, id))
      .returning();
    return updated;
  }

  async deleteEvent(id: string): Promise<void> {
    await db.delete(timelineEvents).where(eq(timelineEvents.id, id));
  }

  async replaceEvents(events: InsertTimelineEvent[]): Promise<TimelineEvent[]> {
    const parsed = events.map((event) => insertTimelineEventSchema.parse(event));
    return db.transaction(async (tx) => {
      await tx.delete(timelineEvents);
      if (parsed.length) {
        await tx.insert(timelineEvents).values(parsed);
      }
      return tx.select().from(timelineEvents).orderBy(timelineEvents.startMonth);
    });
  }

  async seedDefaults(): Promise<void> {
    const existing = await this.listEvents();
    if (existing.length === 0) {
      await this.replaceEvents(DEFAULT_EVENTS);
    }
  }
}

export const storage = new PgStorage();
