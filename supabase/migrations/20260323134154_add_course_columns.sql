-- Add degree and major columns to profiles table
ALTER TABLE "public"."profiles"
ADD COLUMN "degree_level" TEXT,
ADD COLUMN "major_name" TEXT;
