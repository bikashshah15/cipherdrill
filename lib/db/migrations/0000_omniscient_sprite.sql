CREATE TABLE IF NOT EXISTS `attempts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`question_fk` integer NOT NULL,
	`selected_answer` text NOT NULL,
	`is_correct` integer NOT NULL,
	`time_spent_ms` integer NOT NULL,
	`attempted_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`session_id` text NOT NULL,
	`mode` text NOT NULL,
	FOREIGN KEY (`question_fk`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `attempts_question_idx` ON `attempts` (`question_fk`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `attempts_session_idx` ON `attempts` (`session_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `attempts_attempted_at_idx` ON `attempts` (`attempted_at`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `lectures` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`lecture_id` text NOT NULL,
	`title` text NOT NULL,
	`lecture_number` integer NOT NULL,
	`topics` text NOT NULL,
	`question_count` integer DEFAULT 0 NOT NULL,
	`imported_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `lectures_lecture_id_unique` ON `lectures` (`lecture_id`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `questions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`lecture_fk` integer NOT NULL,
	`question_id` text NOT NULL,
	`type` text NOT NULL,
	`difficulty` text NOT NULL,
	`topic` text NOT NULL,
	`stem` text NOT NULL,
	`choices` text NOT NULL,
	`correct_answer` text NOT NULL,
	`mechanistic_explanation` text NOT NULL,
	`distractor_analysis` text NOT NULL,
	`trap_categories` text NOT NULL,
	`diagram_ref` text,
	`game_ref` text,
	FOREIGN KEY (`lecture_fk`) REFERENCES `lectures`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `questions_lecture_question_unique` ON `questions` (`lecture_fk`,`question_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `questions_lecture_idx` ON `questions` (`lecture_fk`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `questions_type_idx` ON `questions` (`type`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `questions_topic_idx` ON `questions` (`topic`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `review_queue` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`question_fk` integer NOT NULL,
	`ease_factor` integer DEFAULT 250 NOT NULL,
	`interval` integer DEFAULT 0 NOT NULL,
	`next_review_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`consecutive_correct` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`question_fk`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `review_queue_question_unique` ON `review_queue` (`question_fk`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `review_queue_next_review_idx` ON `review_queue` (`next_review_at`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`mode` text NOT NULL,
	`lecture_fk` integer,
	`started_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`ended_at` text,
	`questions_attempted` integer DEFAULT 0 NOT NULL,
	`questions_correct` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`lecture_fk`) REFERENCES `lectures`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `sessions_mode_idx` ON `sessions` (`mode`);
