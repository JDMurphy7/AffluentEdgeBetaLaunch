import { sqliteTable, text, integer, real, blob } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  accountBalance: real("account_balance").notNull().default(100000.00),
  customBalance: integer("custom_balance", { mode: "boolean" }).notNull().default(false),
  betaStatus: text("beta_status").notNull().default('pending'), // pending, approved, active, inactive
  hubspotContactId: text("hubspot_contact_id"), // Link to HubSpot contact
  resetToken: text("reset_token"), // Password reset token
  resetExpires: text("reset_expires"), // Reset token expiration
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(new Date()),
});

export const strategies = sqliteTable("strategies", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  rules: blob("rules", { mode: "json" }).notNull(), // JSON object containing strategy rules
  category: text("category").notNull(), // "trend_following", "ict_concepts", "support_resistance", "scalping"
  isBuiltIn: integer("is_built_in", { mode: "boolean" }).notNull().default(false),
  createdBy: integer("created_by"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(new Date()),
});

export const trades = sqliteTable("trades", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  strategyId: integer("strategy_id"),
  symbol: text("symbol").notNull(), // EUR/USD, BTC/USD, GOLD, etc.
  assetClass: text("asset_class").notNull(), // forex, crypto, commodities, stocks, indices
  direction: text("direction").notNull(), // long, short
  entryPrice: real("entry_price").notNull(),
  exitPrice: real("exit_price"),
  stopLoss: real("stop_loss"),
  takeProfit: real("take_profit"),
  quantity: real("quantity").notNull(),
  pnl: real("pnl"),
  status: text("status").notNull().default('open'), // open, closed, cancelled
  aiGrade: text("ai_grade"), // A, B, C, D, F
  aiAnalysis: blob("ai_analysis", { mode: "json" }), // JSON object with AI feedback
  strategyAdherence: integer("strategy_adherence"), // 0-100 percentage
  riskManagementScore: text("risk_management_score"), // A, B, C, D, F
  notes: text("notes"),
  entryTime: integer("entry_time", { mode: "timestamp" }).notNull(),
  exitTime: integer("exit_time", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(new Date()),
});

export const portfolioSnapshots = sqliteTable("portfolio_snapshots", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  balance: real("balance").notNull(),
  equity: real("equity").notNull(),
  drawdown: real("drawdown").notNull().default(0),
  snapshotTime: integer("snapshot_time", { mode: "timestamp" }).notNull().default(new Date()),
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
  entryTime: z.union([z.date(), z.string().transform(str => new Date(str))]),
  exitTime: z.union([z.date(), z.string().transform(str => new Date(str))]).optional(),
});

export const insertPortfolioSnapshotSchema = createInsertSchema(portfolioSnapshots).omit({
  id: true,
  snapshotTime: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = Omit<typeof users.$inferSelect, 'firstName' | 'lastName' | 'hubspotContactId' | 'resetToken' | 'resetExpires'> & {
  firstName?: string | null;
  lastName?: string | null;
  hubspotContactId?: string | null;
  resetToken?: string | null;
  resetExpires?: string | null;
};
export type InsertStrategy = z.infer<typeof insertStrategySchema>;
export type Strategy = typeof strategies.$inferSelect;
export type InsertTrade = z.infer<typeof insertTradeSchema>;
export type Trade = typeof trades.$inferSelect;
export type InsertPortfolioSnapshot = z.infer<typeof insertPortfolioSnapshotSchema>;
export type PortfolioSnapshot = typeof portfolioSnapshots.$inferSelect;

// For future: Partitioning by month for large datasets (Postgres native partitioning)
// Example: PARTITION BY RANGE (entry_time)
