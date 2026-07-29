CREATE TABLE "users" (
	"id" serial PRIMARY KEY,
	"username" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"password" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

