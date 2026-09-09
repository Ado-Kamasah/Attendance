-- ==============================================================================
-- Migration / Update Script: Add SUPER_ADMIN Role & Seed Default Super Admin
-- Compatible with PostgreSQL (Supabase / Production) & SQLite
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. PostgreSQL / Supabase: Update "Role" ENUM or CHECK Constraint
-- ------------------------------------------------------------------------------

-- If you are using a PostgreSQL ENUM type (named "Role" or "role"):
DO $$
BEGIN
  -- Add 'SUPER_ADMIN' to enum if it exists
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Role' OR typname = 'role') THEN
    BEGIN
      ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'SUPER_ADMIN';
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END;
    BEGIN
      ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'FINANCE';
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END;
  END IF;
END $$;

-- If public.users has a check constraint on role, update it:
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE table_name = 'users' AND constraint_name = 'users_role_check'
  ) THEN
    ALTER TABLE public.users DROP CONSTRAINT users_role_check;
    ALTER TABLE public.users ADD CONSTRAINT users_role_check 
      CHECK (role IN ('Student', 'Lecturer', 'Admin', 'Super Admin', 'Finance', 'STUDENT', 'LECTURER', 'ADMIN', 'SUPER_ADMIN', 'FINANCE'));
  END IF;
END $$;


-- ------------------------------------------------------------------------------
-- 2. Seed / Upsert Default Super Admin User
-- ------------------------------------------------------------------------------
-- Email:    superadmin@southshore.edu.gh
-- Login ID: superadmin-001
-- Password: SuperAdminPassword123
-- Hash:     $2a$10$4nFhI/yL000V7hQ8oJjS0uvYh04V58YjN6h1BqfN7Kq8hEaTq2d7W

-- For Prisma "User" table (PostgreSQL):
INSERT INTO "User" ("id", "name", "email", "passwordHash", "role", "program", "createdAt", "updatedAt")
VALUES (
  'superadmin-001',
  'Super Administrator',
  'superadmin@southshore.edu.gh',
  '$2a$10$4nFhI/yL000V7hQ8oJjS0uvYh04V58YjN6h1BqfN7Kq8hEaTq2d7W',
  'SUPER_ADMIN',
  NULL,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("id") DO UPDATE 
SET "role" = 'SUPER_ADMIN',
    "name" = EXCLUDED."name",
    "email" = EXCLUDED."email";

-- If you are also using Supabase "public.users":
INSERT INTO public.users ("id", "name", "email", "role", "created_at")
VALUES (
  'superadmin-001',
  'Super Administrator',
  'superadmin@southshore.edu.gh',
  'SUPER_ADMIN',
  NOW()
)
ON CONFLICT ("id") DO UPDATE 
SET "role" = 'SUPER_ADMIN',
    "name" = EXCLUDED."name";


-- ------------------------------------------------------------------------------
-- 3. SQLite Database (Direct Query if running raw sqlite3 dev.db)
-- ------------------------------------------------------------------------------
-- Note: In SQLite, role is stored as TEXT without strict enum types.
-- You can run:
/*
INSERT INTO "User" ("id", "name", "email", "passwordHash", "role", "program", "createdAt", "updatedAt")
VALUES (
  'superadmin-001',
  'Super Administrator',
  'superadmin@southshore.edu.gh',
  '$2a$10$4nFhI/yL000V7hQ8oJjS0uvYh04V58YjN6h1BqfN7Kq8hEaTq2d7W',
  'SUPER_ADMIN',
  NULL,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT("id") DO UPDATE SET "role" = 'SUPER_ADMIN';
*/

-- ------------------------------------------------------------------------------
-- 4. Useful Query: Promote Any Existing User to Super Admin
-- ------------------------------------------------------------------------------
-- Replace 'admin-001' or the user's email below:
-- UPDATE "User" SET "role" = 'SUPER_ADMIN', "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = 'admin-001';
-- UPDATE public.users SET "role" = 'SUPER_ADMIN' WHERE "email" = 'admin@southshore.edu.gh';
