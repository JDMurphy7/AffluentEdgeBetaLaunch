CREATE TABLE `portfolio_snapshots` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`balance` real NOT NULL,
	`equity` real NOT NULL,
	`drawdown` real DEFAULT 0 NOT NULL,
	`snapshot_time` integer DEFAULT '"2025-07-04T16:26:17.870Z"' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `strategies` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`rules` blob NOT NULL,
	`category` text NOT NULL,
	`is_built_in` integer DEFAULT false NOT NULL,
	`created_by` integer,
	`created_at` integer DEFAULT '"2025-07-04T16:26:17.869Z"' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `trades` (
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
	`created_at` integer DEFAULT '"2025-07-04T16:26:17.870Z"' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
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
	`created_at` integer DEFAULT '"2025-07-04T16:26:17.869Z"' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);