CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS "users" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "username" text NOT NULL UNIQUE,
  "password" text NOT NULL
);

CREATE TABLE IF NOT EXISTS "timeline_events" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" text NOT NULL,
  "start_month" varchar(7) NOT NULL,
  "end_month" varchar(7),
  "category" text NOT NULL,
  "region" text NOT NULL,
  "suggested_prob" integer NOT NULL,
  "your_prob" integer NOT NULL,
  "effective_prob" integer NOT NULL,
  "description" text NOT NULL,
  "rationale" text,
  "planning_prompts" text,
  "sources" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "notes" text
);
