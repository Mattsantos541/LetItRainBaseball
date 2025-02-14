import {
  users,
  teams,
  players,
  trades,
  tradeItems,
  type User,
  type Team,
  type Player,
  type Trade,
  type TradeItem,
  type InsertUser
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Team methods
  getTeam(id: number): Promise<Team | undefined>;
  getTeamsByUserId(userId: number): Promise<Team[]>;
  createTeam(team: Omit<Team, "id">): Promise<Team>;

  // Player methods
  getPlayer(id: number): Promise<Player | undefined>;
  getPlayersByTeamId(teamId: number): Promise<Player[]>;
  createPlayer(player: Omit<Player, "id">): Promise<Player>;
  updatePlayer(id: number, updates: Partial<Player>): Promise<Player>;

  // Trade methods
  getTrade(id: number): Promise<Trade | undefined>;
  getTradesByTeamId(teamId: number): Promise<Trade[]>;
  createTrade(trade: Omit<Trade, "id">): Promise<Trade>;
  updateTradeStatus(id: number, status: string): Promise<Trade>;
  getTradeItems(tradeId: number): Promise<TradeItem[]>;

  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getTeam(id: number): Promise<Team | undefined> {
    const [team] = await db.select().from(teams).where(eq(teams.id, id));
    return team;
  }

  async getTeamsByUserId(userId: number): Promise<Team[]> {
    return db.select().from(teams).where(eq(teams.userId, userId));
  }

  async createTeam(team: Omit<Team, "id">): Promise<Team> {
    const [newTeam] = await db.insert(teams).values(team).returning();
    return newTeam;
  }

  async getPlayer(id: number): Promise<Player | undefined> {
    const [player] = await db.select().from(players).where(eq(players.id, id));
    return player;
  }

  async getPlayersByTeamId(teamId: number): Promise<Player[]> {
    return db.select().from(players).where(eq(players.teamId, teamId));
  }

  async createPlayer(player: Omit<Player, "id">): Promise<Player> {
    const [newPlayer] = await db.insert(players).values(player).returning();
    return newPlayer;
  }

  async updatePlayer(id: number, updates: Partial<Player>): Promise<Player> {
    const [updatedPlayer] = await db
      .update(players)
      .set(updates)
      .where(eq(players.id, id))
      .returning();
    return updatedPlayer;
  }

  async getTrade(id: number): Promise<Trade | undefined> {
    const [trade] = await db.select().from(trades).where(eq(trades.id, id));
    return trade;
  }

  async getTradesByTeamId(teamId: number): Promise<Trade[]> {
    return db
      .select()
      .from(trades)
      .where(eq(trades.proposingTeamId, teamId))
      .or(eq(trades.receivingTeamId, teamId));
  }

  async createTrade(trade: Omit<Trade, "id">): Promise<Trade> {
    const [newTrade] = await db.insert(trades).values(trade).returning();
    return newTrade;
  }

  async updateTradeStatus(id: number, status: string): Promise<Trade> {
    const [updatedTrade] = await db
      .update(trades)
      .set({ status })
      .where(eq(trades.id, id))
      .returning();
    return updatedTrade;
  }

  async getTradeItems(tradeId: number): Promise<TradeItem[]> {
    return db.select().from(tradeItems).where(eq(tradeItems.tradeId, tradeId));
  }
}

export const storage = new DatabaseStorage();