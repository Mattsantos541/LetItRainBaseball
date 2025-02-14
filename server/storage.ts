import { users, teams, players, trades, tradeItems } from "@shared/schema";
import type { InsertUser, User, Team, Player, Trade, TradeItem } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

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
  
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private teams: Map<number, Team>;
  private players: Map<number, Player>;
  private trades: Map<number, Trade>;
  private tradeItems: Map<number, TradeItem>;
  private currentId: number;
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.teams = new Map();
    this.players = new Map();
    this.trades = new Map();
    this.tradeItems = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getTeam(id: number): Promise<Team | undefined> {
    return this.teams.get(id);
  }

  async getTeamsByUserId(userId: number): Promise<Team[]> {
    return Array.from(this.teams.values()).filter(team => team.userId === userId);
  }

  async createTeam(team: Omit<Team, "id">): Promise<Team> {
    const id = this.currentId++;
    const newTeam: Team = { ...team, id };
    this.teams.set(id, newTeam);
    return newTeam;
  }

  async getPlayer(id: number): Promise<Player | undefined> {
    return this.players.get(id);
  }

  async getPlayersByTeamId(teamId: number): Promise<Player[]> {
    return Array.from(this.players.values()).filter(player => player.teamId === teamId);
  }

  async createPlayer(player: Omit<Player, "id">): Promise<Player> {
    const id = this.currentId++;
    const newPlayer: Player = { ...player, id };
    this.players.set(id, newPlayer);
    return newPlayer;
  }

  async updatePlayer(id: number, updates: Partial<Player>): Promise<Player> {
    const player = await this.getPlayer(id);
    if (!player) throw new Error("Player not found");
    const updatedPlayer = { ...player, ...updates };
    this.players.set(id, updatedPlayer);
    return updatedPlayer;
  }

  async getTrade(id: number): Promise<Trade | undefined> {
    return this.trades.get(id);
  }

  async getTradesByTeamId(teamId: number): Promise<Trade[]> {
    return Array.from(this.trades.values()).filter(
      trade => trade.proposingTeamId === teamId || trade.receivingTeamId === teamId
    );
  }

  async createTrade(trade: Omit<Trade, "id">): Promise<Trade> {
    const id = this.currentId++;
    const newTrade: Trade = { ...trade, id };
    this.trades.set(id, newTrade);
    return newTrade;
  }

  async updateTradeStatus(id: number, status: string): Promise<Trade> {
    const trade = await this.getTrade(id);
    if (!trade) throw new Error("Trade not found");
    const updatedTrade = { ...trade, status };
    this.trades.set(id, updatedTrade);
    return updatedTrade;
  }

  async getTradeItems(tradeId: number): Promise<TradeItem[]> {
    return Array.from(this.tradeItems.values()).filter(item => item.tradeId === tradeId);
  }
}

export const storage = new MemStorage();
