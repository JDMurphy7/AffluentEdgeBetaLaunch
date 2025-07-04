PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_portfolio_snapshots` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`balance` real NOT NULL,
	`equity` real NOT NULL,
	`drawdown` real DEFAULT 0 NOT NULL,
	`snapshot_time` integer DEFAULT '"2025-07-04T16:50:29.656Z"' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_portfolio_snapshots`("id", "user_id", "balance", "equity", "drawdown", "snapshot_time") SELECT "id", "user_id", "balance", "equity", "drawdown", "snapshot_time" FROM `portfolio_snapshots`;--> statement-breakpoint
DROP TABLE `portfolio_snapshots`;--> statement-breakpoint
ALTER TABLE `__new_portfolio_snapshots` RENAME TO `portfolio_snapshots`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_strategies` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`rules` blob NOT NULL,
	`category` text NOT NULL,
	`is_built_in` integer DEFAULT false NOT NULL,
	`created_by` integer,
	`created_at` integer DEFAULT '"2025-07-04T16:50:29.656Z"' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_strategies`("id", "name", "description", "rules", "category", "is_built_in", "created_by", "created_at") SELECT "id", "name", "description", "rules", "category", "is_built_in", "created_by", "created_at" FROM `strategies`;--> statement-breakpoint
DROP TABLE `strategies`;--> statement-breakpoint
ALTER TABLE `__new_strategies` RENAME TO `strategies`;--> statement-breakpoint
CREATE TABLE `__new_trades` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`strategy_id` integer,
	`symbol` text NOT NULL,
	`asset_class` text NOT NULL,
	`direction` text NOT NULL,
	`entry_price` real NOT NULL,
	`exit_price` real,
	`stop_loss` real,
	`take_profit` real,
	`quantity` real NOT NULL,
	`pnl` real,
	`status` text DEFAULT 'open' NOT NULL,
	`ai_grade` text,
	`ai_analysis` blob,
	`strategy_adherence` integer,
	`risk_management_score` text,
	`notes` text,
	`entry_time` integer NOT NULL,
	`exit_time` integer,
	`created_at` integer DEFAULT '"2025-07-04T16:50:29.656Z"' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_trades`("id", "user_id", "strategy_id", "symbol", "asset_class", "direction", "entry_price", "exit_price", "stop_loss", "take_profit", "quantity", "pnl", "status", "ai_grade", "ai_analysis", "strategy_adherence", "risk_management_score", "notes", "entry_time", "exit_time", "created_at") SELECT "id", "user_id", "strategy_id", "symbol", "asset_class", "direction", "entry_price", "exit_price", "stop_loss", "take_profit", "quantity", "pnl", "status", "ai_grade", "ai_analysis", "strategy_adherence", "risk_management_score", "notes", "entry_time", "exit_time", "created_at" FROM `trades`;--> statement-breakpoint
DROP TABLE `trades`;--> statement-breakpoint
ALTER TABLE `__new_trades` RENAME TO `trades`;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`first_name` text,
	`last_name` text,
	`account_balance` real DEFAULT 100000 NOT NULL,
	`custom_balance` integer DEFAULT false NOT NULL,
	`beta_status` text DEFAULT 'pending' NOT NULL,
	`hubspot_contact_id` text,
	`reset_token` text,
	`reset_expires` text,
	`created_at` integer DEFAULT '"2025-07-04T16:50:29.655Z"' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "email", "password", "first_name", "last_name", "account_balance", "custom_balance", "beta_status", "hubspot_contact_id", "reset_token", "reset_expires", "created_at") SELECT "id", "email", "password", "first_name", "last_name", "account_balance", "custom_balance", "beta_status", "hubspot_contact_id", "reset_token", "reset_expires", "created_at" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);