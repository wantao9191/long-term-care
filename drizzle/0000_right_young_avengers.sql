CREATE TABLE "menus" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"code" varchar(50) NOT NULL,
	"description" text,
	"status" integer DEFAULT 1,
	"create_time" timestamp DEFAULT now(),
	CONSTRAINT "menus_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"code" varchar(50) NOT NULL,
	"description" text,
	"status" integer DEFAULT 1,
	"create_time" timestamp DEFAULT now(),
	CONSTRAINT "organizations_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"code" varchar(50) NOT NULL,
	"description" text,
	"status" integer DEFAULT 1,
	"create_time" timestamp DEFAULT now(),
	"roles" json,
	CONSTRAINT "permissions_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"code" varchar(50) NOT NULL,
	"menus" json,
	"permissions" json,
	"description" text,
	"status" integer DEFAULT 1,
	"create_time" timestamp DEFAULT now(),
	CONSTRAINT "roles_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"username" varchar(50) NOT NULL,
	"password" varchar(255) NOT NULL,
	"phone" varchar(11) NOT NULL,
	"name" varchar(50) NOT NULL,
	"status" integer DEFAULT 1,
	"create_time" timestamp DEFAULT now(),
	"roles" json,
	"organization_id" bigserial
);
--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;