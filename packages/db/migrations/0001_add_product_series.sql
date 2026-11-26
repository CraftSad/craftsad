DO $$ BEGIN
 CREATE TYPE "public"."tag_series" AS ENUM('classic', 'slate', 'kids', 'provence');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "series" "tag_series" DEFAULT 'classic' NOT NULL;
