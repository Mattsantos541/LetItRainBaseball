import { pgTable, text, serial, integer, boolean, date, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  userId: integer("user_id").notNull(),
  salaryCap: decimal("salary_cap").notNull().default("400"),
  rosterSize: integer("roster_size").notNull().default(40),
});

export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  position: text("position").notNull(),
  teamId: integer("team_id"),
  salary: decimal("salary").notNull(),
  contractYear: integer("contract_year").notNull().default(1),
  isRookie: boolean("is_rookie").notNull().default(true),
  stats: text("stats").notNull(),
});

export const trades = pgTable("trades", {
  id: serial("id").primaryKey(),
  proposingTeamId: integer("proposing_team_id").notNull(),
  receivingTeamId: integer("receiving_team_id").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: date("created_at").notNull(),
});

export const tradeItems = pgTable("trade_items", {
  id: serial("id").primaryKey(),
  tradeId: integer("trade_id").notNull(),
  playerId: integer("player_id").notNull(),
  fromTeamId: integer("from_team_id").notNull(),
  toTeamId: integer("to_team_id").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertTeamSchema = createInsertSchema(teams).pick({
  name: true,
  userId: true,
});

export const insertPlayerSchema = createInsertSchema(players).pick({
  name: true,
  position: true,
  teamId: true,
  salary: true,
  contractYear: true,
  isRookie: true,
  stats: true,
});

export const insertTradeSchema = createInsertSchema(trades).pick({
  proposingTeamId: true,
  receivingTeamId: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Team = typeof teams.$inferSelect;
export type Player = typeof players.$inferSelect;
export type Trade = typeof trades.$inferSelect;
export type TradeItem = typeof tradeItems.$inferSelect;
