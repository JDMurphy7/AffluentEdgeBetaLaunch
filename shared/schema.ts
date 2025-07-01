import { pgTable, text, serial, integer, boolean, decimal, timestamp, varchar, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  accountBalance: decimal("account_balance", { precision: 15, scale: 2 }).notNull().default('100000.00'),
  customBalance: boolean("custom_balance").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const strategies = pgTable("strategies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  rules: jsonb("rules").notNull(), // JSON object containing strategy rules
  category: text("category").notNull(), // "trend_following", "ict_concepts", "support_resistance", "scalping"
  isBuiltIn: boolean("is_built_in").notNull().default(false),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const trades = pgTable("trades", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  strategyId: integer("strategy_id"),
  symbol: text("symbol").notNull(), // EUR/USD, BTC/USD, GOLD, etc.
  assetClass: text("asset_class").notNull(), // forex, crypto, commodities, stocks, indices
  direction: text("direction").notNull(), // long, short
  entryPrice: decimal("entry_price", { precision: 15, scale: 8 }).notNull(),
  exitPrice: decimal("exit_price", { precision: 15, scale: 8 }),
  stopLoss: decimal("stop_loss", { precision: 15, scale: 8 }),
  takeProfit: decimal("take_profit", { precision: 15, scale: 8 }),
  quantity: decimal("quantity", { precision: 15, scale: 4 }).notNull(),
  pnl: decimal("pnl", { precision: 15, scale: 2 }),
  status: text("status").notNull().default('open'), // open, closed, cancelled
  aiGrade: text("ai_grade"), // A, B, C, D, F
  aiAnalysis: jsonb("ai_analysis"), // JSON object with AI feedback
  strategyAdherence: integer("strategy_adherence"), // 0-100 percentage
  riskManagementScore: text("risk_management_score"), // A, B, C, D, F
  notes: text("notes"),
  entryTime: timestamp("entry_time").notNull(),
  exitTime: timestamp("exit_time"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const portfolioSnapshots = pgTable("portfolio_snapshots", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  balance: decimal("balance", { precision: 15, scale: 2 }).notNull(),
  equity: decimal("equity", { precision: 15, scale: 2 }).notNull(),
  drawdown: decimal("drawdown", { precision: 15, scale: 2 }).notNull().default('0'),
  snapshotTime: timestamp("snapshot_time").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  trades: many(trades),
  portfolioSnapshots: many(portfolioSnapshots),
  strategies: many(strategies),
}));

export const strategiesRelations = relations(strategies, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [strategies.createdBy],
    references: [users.id],
  }),
  trades: many(trades),
}));

export const tradesRelations = relations(trades, ({ one }) => ({
  user: one(users, {
    fields: [trades.userId],
    references: [users.id],
  }),
  strategy: one(strategies, {
    fields: [trades.strategyId],
    references: [strategies.id],
  }),
}));

export const portfolioSnapshotsRelations = relations(portfolioSnapshots, ({ one }) => ({
  user: one(users, {
    fields: [portfolioSnapshots.userId],
    references: [users.id],
  }),
}));

// Zod schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertStrategySchema = createInsertSchema(strategies).omit({
  id: true,
  createdAt: true,
});

export const insertTradeSchema = createInsertSchema(trades).omit({
  id: true,
  createdAt: true,
  aiGrade: true,
  aiAnalysis: true,
  strategyAdherence: true,
  riskManagementScore: true,
}).extend({
  naturalLanguageInput: z.string().optional(),
});

export const insertPortfolioSnapshotSchema = createInsertSchema(portfolioSnapshots).omit({
  id: true,
  snapshotTime: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertStrategy = z.infer<typeof insertStrategySchema>;
export type Strategy = typeof strategies.$inferSelect;
export type InsertTrade = z.infer<typeof insertTradeSchema>;
export type Trade = typeof trades.$inferSelect;
export type InsertPortfolioSnapshot = z.infer<typeof insertPortfolioSnapshotSchema>;
export type PortfolioSnapshot = typeof portfolioSnapshots.$inferSelect;
