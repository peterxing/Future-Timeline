import { sql } from "drizzle-orm";
import { integer, jsonb, pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const categoryValues = [
  "AI & Robotics",
  "Science & Technology",
  "Society & Policy",
  "Society & Culture",
  "Space",
  "Environment",
  "Other",
] as const;

export const regionValues = [
  "Global",
  "USA",
  "EU",
  "China",
  "India",
  "Africa",
  "Other",
] as const;

export type Category = (typeof categoryValues)[number];
export type Region = (typeof regionValues)[number];

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const timelineEvents = pgTable("timeline_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  startMonth: varchar("start_month", { length: 7 }).notNull(),
  endMonth: varchar("end_month", { length: 7 }),
  category: text("category").$type<Category>().notNull(),
  region: text("region").$type<Region>().notNull(),
  suggestedProb: integer("suggested_prob").notNull(),
  yourProb: integer("your_prob").notNull(),
  effectiveProb: integer("effective_prob").notNull(),
  description: text("description").notNull(),
  rationale: text("rationale"),
  planningPrompts: text("planning_prompts"),
  sources: jsonb("sources")
    .$type<{ title: string; url: string }[]>()
    .notNull()
    .default(sql`'[]'::jsonb`),
  notes: text("notes"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

const baseEventSchema = createInsertSchema(timelineEvents, {
  category: z.enum(categoryValues),
  region: z.enum(regionValues),
  sources: z
    .array(z.object({ title: z.string(), url: z.string().url().or(z.literal("#")) }))
    .default([]),
});

export const insertTimelineEventSchema = baseEventSchema;
export const updateTimelineEventSchema = baseEventSchema.partial();

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertTimelineEvent = z.infer<typeof insertTimelineEventSchema>;
export type TimelineEvent = typeof timelineEvents.$inferSelect;
