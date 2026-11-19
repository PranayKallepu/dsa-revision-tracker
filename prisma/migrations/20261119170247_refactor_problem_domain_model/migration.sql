-- CreateEnum
CREATE TYPE "ProblemSolvingStatus" AS ENUM ('SOLVED', 'NOT_SOLVED');

-- CreateEnum
CREATE TYPE "SolutionType" AS ENUM ('BRUTE_FORCE', 'OPTIMIZED');

-- AlterTable
ALTER TABLE "attempts" ADD COLUMN     "cycle_number" INTEGER;

-- AlterTable
ALTER TABLE "problems" ADD COLUMN     "current_cycle" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "is_mastered" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mastered_at" TIMESTAMP(3),
ADD COLUMN     "solving_status" "ProblemSolvingStatus" NOT NULL DEFAULT 'SOLVED',
ADD COLUMN     "time_spent_seconds" INTEGER,
ALTER COLUMN "original_solved_at" DROP NOT NULL;

-- CreateTable
CREATE TABLE "problem_solutions" (
    "id" TEXT NOT NULL,
    "problem_id" TEXT NOT NULL,
    "solution_type" "SolutionType" NOT NULL,
    "approach" TEXT NOT NULL,
    "time_complexity" TEXT,
    "space_complexity" TEXT,
    "improvement_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "problem_solutions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "problem_blockers" (
    "id" TEXT NOT NULL,
    "problem_id" TEXT NOT NULL,
    "stuck_point" TEXT,
    "approaches_tried" TEXT,
    "concepts_to_learn" TEXT,
    "failure_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "problem_blockers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "problem_solutions_problem_id_idx" ON "problem_solutions"("problem_id");

-- CreateIndex
CREATE INDEX "problem_solutions_problem_id_solution_type_idx" ON "problem_solutions"("problem_id", "solution_type");

-- CreateIndex
CREATE INDEX "problem_blockers_problem_id_idx" ON "problem_blockers"("problem_id");

-- CreateIndex
CREATE INDEX "attempts_problem_id_cycle_number_idx" ON "attempts"("problem_id", "cycle_number");

-- CreateIndex
CREATE INDEX "problems_solving_status_idx" ON "problems"("solving_status");

-- CreateIndex
CREATE INDEX "problems_is_mastered_idx" ON "problems"("is_mastered");

-- CreateIndex
CREATE INDEX "problems_user_id_solving_status_idx" ON "problems"("user_id", "solving_status");

-- CreateIndex
CREATE INDEX "problems_user_id_is_mastered_idx" ON "problems"("user_id", "is_mastered");

-- AddForeignKey
ALTER TABLE "problem_solutions" ADD CONSTRAINT "problem_solutions_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "problem_blockers" ADD CONSTRAINT "problem_blockers_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Data Migration: Migrate existing time duration to time_spent_seconds
UPDATE "problems" SET "time_spent_seconds" = "initial_solve_duration_seconds" WHERE "initial_solve_duration_seconds" IS NOT NULL;

-- Data Migration: Migrate unsolved problems (e.g. marked 'Not Solved' in notes)
UPDATE "problems" 
SET "solving_status" = 'NOT_SOLVED', 
    "original_solved_at" = NULL, 
    "initial_solve_duration_seconds" = NULL 
WHERE "notes" ILIKE '%not solved%';

-- Data Migration: Create blocker records for unsolved problems
INSERT INTO "problem_blockers" ("id", "problem_id", "stuck_point", "failure_reason", "created_at", "updated_at")
SELECT 'blk_' || "id", "id", NULLIF("mistakes", ''), NULLIF("notes", ''), "created_at", "updated_at"
FROM "problems" 
WHERE "solving_status" = 'NOT_SOLVED';

-- Data Migration: Create initial solution records for solved problems with approaches or complexities
INSERT INTO "problem_solutions" ("id", "problem_id", "solution_type", "approach", "time_complexity", "space_complexity", "improvement_notes", "created_at", "updated_at")
SELECT 'sol_' || "id", "id", 'BRUTE_FORCE'::"SolutionType", COALESCE(NULLIF("approach", ''), 'Initial solution approach'), NULLIF("time_complexity", ''), NULLIF("space_complexity", ''), NULLIF("notes", ''), "created_at", "updated_at"
FROM "problems"
WHERE "solving_status" = 'SOLVED' AND (
  ("approach" IS NOT NULL AND "approach" != '') OR 
  ("time_complexity" IS NOT NULL AND "time_complexity" != '') OR 
  ("space_complexity" IS NOT NULL AND "space_complexity" != '')
);

-- Data Migration: Mark already-mastered problems
UPDATE "problems" SET "is_mastered" = true, "mastered_at" = "updated_at" WHERE "status" = 'MASTERED';

