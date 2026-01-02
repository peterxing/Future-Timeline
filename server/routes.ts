import express, { type Express, type NextFunction, type Request, type Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTimelineEventSchema, updateTimelineEventSchema } from "@shared/schema";
import { DEFAULT_EVENTS } from "@shared/mockData";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await storage.seedDefaults();

  const router = express.Router();

  router.get("/events", async (_req, res, next) => {
    try {
      const events = await storage.listEvents();
      res.json(events);
    } catch (error) {
      next(error);
    }
  });

  router.post("/events", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = insertTimelineEventSchema.parse(req.body);
      const created = await storage.createEvent(parsed);
      res.status(201).json(created);
    } catch (error) {
      next(error);
    }
  });

  router.put("/events/:id", async (req, res, next) => {
    try {
      const parsed = updateTimelineEventSchema.parse(req.body);
      const updated = await storage.updateEvent(req.params.id, parsed);

      if (!updated) {
        res.status(404).json({ message: "Event not found" });
        return;
      }

      res.json(updated);
    } catch (error) {
      next(error);
    }
  });

  router.delete("/events/:id", async (req, res, next) => {
    try {
      await storage.deleteEvent(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  router.post("/events/import", async (req, res, next) => {
    try {
      const parsed = z.array(insertTimelineEventSchema).parse(req.body?.events ?? req.body);
      const events = await storage.replaceEvents(parsed);
      res.json(events);
    } catch (error) {
      next(error);
    }
  });

  router.post("/events/reset", async (_req, res, next) => {
    try {
      const events = await storage.replaceEvents(DEFAULT_EVENTS);
      res.json(events);
    } catch (error) {
      next(error);
    }
  });

  app.use("/api", router);

  return httpServer;
}
