import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertTeamSchema, insertPlayerSchema, insertTradeSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Teams
  app.get("/api/teams", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const teams = await storage.getTeamsByUserId(req.user.id);
    res.json(teams);
  });

  app.post("/api/teams", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const validated = insertTeamSchema.parse({ ...req.body, userId: req.user.id });
    const team = await storage.createTeam(validated);
    res.status(201).json(team);
  });

  // Players
  app.get("/api/teams/:teamId/players", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const players = await storage.getPlayersByTeamId(parseInt(req.params.teamId));
    res.json(players);
  });

  app.post("/api/teams/:teamId/players", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const validated = insertPlayerSchema.parse({
      ...req.body,
      teamId: parseInt(req.params.teamId),
    });
    const player = await storage.createPlayer(validated);
    res.status(201).json(player);
  });

  app.patch("/api/players/:playerId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const player = await storage.updatePlayer(parseInt(req.params.playerId), req.body);
    res.json(player);
  });

  // Trades
  app.get("/api/teams/:teamId/trades", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const trades = await storage.getTradesByTeamId(parseInt(req.params.teamId));
    res.json(trades);
  });

  app.post("/api/trades", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const validated = insertTradeSchema.parse(req.body);
    const trade = await storage.createTrade({
      ...validated,
      createdAt: new Date(),
      status: "pending"
    });
    res.status(201).json(trade);
  });

  app.patch("/api/trades/:tradeId/status", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const trade = await storage.updateTradeStatus(
      parseInt(req.params.tradeId),
      req.body.status
    );
    res.json(trade);
  });

  const httpServer = createServer(app);
  return httpServer;
}
