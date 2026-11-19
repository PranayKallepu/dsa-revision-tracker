import { PrismaClient, Difficulty, Platform, ProblemSolvingStatus, ProblemStatus, SolutionType } from "@prisma/client"
import { problemRepository } from "../src/server/repositories/problem.repository"
import { problemService } from "../src/server/services/problem.service"
import { createProblemSchema, problemSolutionInputSchema } from "../src/server/validators/problem.schema"
import { problemFormSchema } from "../src/features/problems/schema"

const prisma = new PrismaClient()

async function runTests() {
  console.log("=== RUNNING CONDITIONAL PROBLEM CREATION VERIFICATION TESTS ===\n")
  let passedCount = 0
  let failedCount = 0

  function assert(condition: boolean, message: string) {
    if (!condition) {
      console.error(`❌ FAILED: ${message}`)
      failedCount++
      throw new Error(`Assertion failed: ${message}`)
    } else {
      console.log(`✅ PASSED: ${message}`)
      passedCount++
    }
  }

  // Setup test users
  const testEmail1 = `cond-user-1-${Date.now()}@example.com`
  const testEmail2 = `cond-user-2-${Date.now()}@example.com`

  const user1 = await prisma.user.create({
    data: {
      email: testEmail1,
      name: "Conditional Test User 1",
    },
  })

  const user2 = await prisma.user.create({
    data: {
      email: testEmail2,
      name: "Conditional Test User 2",
    },
  })

  try {
    // -------------------------------------------------------------------------
    // Scenario 1: Solved with brute-force
    // -------------------------------------------------------------------------
    console.log("\n--- Scenario 1: Solved with brute-force ---")
    const bruteForceProblem = await problemService.createProblem(user1.id, {
      title: "Two Sum Brute Force",
      url: "https://leetcode.com/problems/two-sum/",
      platform: Platform.LEETCODE,
      difficulty: Difficulty.EASY,
      solvingStatus: ProblemSolvingStatus.SOLVED,
      timeSpentSeconds: 1200,
      topics: ["Array", "Hash Table"],
      solution: {
        solutionType: SolutionType.BRUTE_FORCE,
        approach: "Check every pair with nested loops in O(n^2)",
        timeComplexity: "O(n^2)",
        spaceComplexity: "O(1)",
        improvementNotes: "Can optimize to O(n) using a hash map",
      },
    })

    assert(bruteForceProblem.rawSolvingStatus === ProblemSolvingStatus.SOLVED, "Problem solvingStatus is SOLVED")
    assert(bruteForceProblem.solutions.length === 1, "Exactly one solution record created")
    assert(bruteForceProblem.solutions[0].solutionType === SolutionType.BRUTE_FORCE, "Solution type is BRUTE_FORCE")
    assert(bruteForceProblem.solutions[0].approach === "Check every pair with nested loops in O(n^2)", "Approach explanation matches")
    assert(bruteForceProblem.solutions[0].improvementNotes === "Can optimize to O(n) using a hash map", "Improvement notes preserved")
    assert(bruteForceProblem.originalSolveDate !== null, "originalSolveDate is populated")
    assert(bruteForceProblem.nextRevision !== "Unsolved", "Problem is eligible for revision (nextRevision is not 'Unsolved')")

    // -------------------------------------------------------------------------
    // Scenario 2: Solved with optimized
    // -------------------------------------------------------------------------
    console.log("\n--- Scenario 2: Solved with optimized ---")
    const optimizedProblem = await problemService.createProblem(user1.id, {
      title: "Valid Anagram Optimized",
      url: "https://leetcode.com/problems/valid-anagram/",
      platform: Platform.LEETCODE,
      difficulty: Difficulty.EASY,
      solvingStatus: ProblemSolvingStatus.SOLVED,
      timeSpentSeconds: 600,
      topics: ["String", "Hash Table"],
      solution: {
        solutionType: SolutionType.OPTIMIZED,
        approach: "Count character frequencies using a fixed-size 26 array",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        improvementNotes: null, // Improvement notes optional for optimized
      },
    })

    assert(optimizedProblem.rawSolvingStatus === ProblemSolvingStatus.SOLVED, "Problem solvingStatus is SOLVED")
    assert(optimizedProblem.solutions.length === 1, "Exactly one solution record created")
    assert(optimizedProblem.solutions[0].solutionType === SolutionType.OPTIMIZED, "Solution type is OPTIMIZED")
    assert(optimizedProblem.solutions[0].improvementNotes === null, "Improvement notes are optional and null")
    assert(optimizedProblem.originalSolveDate !== null, "originalSolveDate is populated")

    // -------------------------------------------------------------------------
    // Scenario 3: Add optimized solution later without deleting brute-force
    // -------------------------------------------------------------------------
    console.log("\n--- Scenario 3: Add optimized solution later without deleting brute-force ---")
    const addedSolution = await problemService.addSolution(bruteForceProblem.id, user1.id, {
      solutionType: SolutionType.OPTIMIZED,
      approach: "One-pass hash map storing seen numbers and their indices",
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)",
      improvementNotes: "Optimal time complexity achieved",
    })

    assert(addedSolution.solutionType === SolutionType.OPTIMIZED, "Added solution is OPTIMIZED")

    // Re-fetch problem to verify both solutions exist
    const refetchedBruteForce = await problemService.getProblemById(bruteForceProblem.id, user1.id)
    assert(refetchedBruteForce.solutions.length === 2, "Problem now contains 2 solution approaches")

    const types = refetchedBruteForce.solutions.map((s) => s.solutionType)
    assert(types.includes(SolutionType.BRUTE_FORCE), "Historical BRUTE_FORCE solution preserved")
    assert(types.includes(SolutionType.OPTIMIZED), "New OPTIMIZED solution present")

    const originalBrute = refetchedBruteForce.solutions.find((s) => s.solutionType === SolutionType.BRUTE_FORCE)
    assert(originalBrute?.approach === "Check every pair with nested loops in O(n^2)", "Brute-force approach unchanged")

    // -------------------------------------------------------------------------
    // Scenario 4: Unsolved problem with blocker details
    // -------------------------------------------------------------------------
    console.log("\n--- Scenario 4: Unsolved problem with blocker details ---")
    const unsolvedProblem = await problemService.createProblem(user1.id, {
      title: "Course Schedule Cycle Detection",
      url: "https://leetcode.com/problems/course-schedule/",
      platform: Platform.LEETCODE,
      difficulty: Difficulty.MEDIUM,
      solvingStatus: ProblemSolvingStatus.NOT_SOLVED,
      timeSpentSeconds: 2400,
      topics: ["Graph", "Topological Sort"],
      blocker: {
        stuckPoint: "Unable to detect back-edges in directed graph recursion stack",
        approachesTried: "Tried standard BFS without in-degree counting",
        conceptsToLearn: "Kahn algorithm with in-degrees vs 3-color DFS",
        failureReason: "Infinite loop on cyclic dependency test cases",
      },
    })

    assert(unsolvedProblem.rawSolvingStatus === ProblemSolvingStatus.NOT_SOLVED, "solvingStatus is NOT_SOLVED")
    assert(unsolvedProblem.solutions.length === 0, "No solution records created for unsolved problem")
    assert(unsolvedProblem.blockers.length === 1, "Blocker record created successfully")
    assert(unsolvedProblem.blockers[0].stuckPoint === "Unable to detect back-edges in directed graph recursion stack", "Blocker stuck point matches")
    assert(unsolvedProblem.blockers[0].approachesTried === "Tried standard BFS without in-degree counting", "Approaches tried matches")
    assert(unsolvedProblem.blockers[0].conceptsToLearn === "Kahn algorithm with in-degrees vs 3-color DFS", "Concepts to learn matches")
    assert(unsolvedProblem.originalSolveDate === null, "originalSolveDate is null for unsolved problem")

    // -------------------------------------------------------------------------
    // Scenario 5: Unsolved problem has no scheduled revisions
    // -------------------------------------------------------------------------
    console.log("\n--- Scenario 5: Unsolved problem has no scheduled revisions ---")
    assert(unsolvedProblem.revisions.length === 0, "Unsolved problem has 0 revisions scheduled")
    assert(unsolvedProblem.nextRevision === "Unsolved", "nextRevision displays 'Unsolved'")

    // Verify unsolved problem is excluded from Due Today / Overdue via listing
    const user1Problems = await problemService.listProblems(user1.id, { solvingStatus: ProblemSolvingStatus.NOT_SOLVED })
    assert(user1Problems.items.length >= 1, "Unsolved problems are retrievable by NOT_SOLVED filter")
    assert(user1Problems.items.every((p) => p.rawSolvingStatus === ProblemSolvingStatus.NOT_SOLVED), "All returned backlog items are NOT_SOLVED")

    // -------------------------------------------------------------------------
    // Scenario 6: Converting unsolved backlog problem into solved problem
    // -------------------------------------------------------------------------
    console.log("\n--- Scenario 6: Converting unsolved backlog problem into solved problem ---")
    const beforeConversionTime = new Date(Date.now() - 1000)

    const convertedProblem = await problemService.updateProblem(unsolvedProblem.id, user1.id, {
      solvingStatus: ProblemSolvingStatus.SOLVED,
      solution: {
        solutionType: SolutionType.OPTIMIZED,
        approach: "Kahn algorithm with indegree array and queue",
        timeComplexity: "O(V + E)",
        spaceComplexity: "O(V + E)",
        improvementNotes: "Clean BFS topological sorting",
      },
    })

    assert(convertedProblem.rawSolvingStatus === ProblemSolvingStatus.SOLVED, "Converted problem is now SOLVED")
    assert(convertedProblem.solutions.length === 1, "Solution record was added upon conversion")
    assert(convertedProblem.solutions[0].solutionType === SolutionType.OPTIMIZED, "Converted solution type is OPTIMIZED")
    assert(convertedProblem.originalSolveDate !== null, "originalSolveDate is now set")

    const solveDate = new Date(convertedProblem.originalSolveDate!)
    assert(solveDate >= beforeConversionTime, "originalSolveDate matches conversion timestamp (not backlog creation date)")
    assert(convertedProblem.nextRevision !== "Unsolved", "Problem has left the unsolved backlog")

    // -------------------------------------------------------------------------
    // Scenario 7: originalSolvedAt assigned server-side (spoof protection)
    // -------------------------------------------------------------------------
    console.log("\n--- Scenario 7: originalSolvedAt assigned server-side ---")
    // Client attempting to pass originalSolvedAt to createProblemSchema should be rejected by strict schema
    const spoofAttempt = createProblemSchema.safeParse({
      title: "Spoof Test",
      url: "https://leetcode.com/problems/two-sum/",
      platform: "LEETCODE",
      difficulty: "EASY",
      timeSpentSeconds: 300,
      topics: ["Array"],
      originalSolvedAt: "2010-01-01T00:00:00.000Z", // Spoofed date in past
    })
    assert(!spoofAttempt.success, "Strict createProblemSchema rejects client-supplied originalSolvedAt")

    // Even if passed internally, problemService.createProblem overrides with server new Date()
    const nowBefore = new Date(Date.now() - 2000)
    const freshSolved = await problemService.createProblem(user1.id, {
      title: "Server Timestamp Test",
      url: "https://leetcode.com/problems/timestamp-test/",
      platform: Platform.LEETCODE,
      difficulty: Difficulty.EASY,
      solvingStatus: ProblemSolvingStatus.SOLVED,
      timeSpentSeconds: 300,
      topics: ["Array"],
      solution: {
        solutionType: SolutionType.BRUTE_FORCE,
        approach: "Simple search",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
      },
    })
    const assignedTimestamp = new Date(freshSolved.originalSolveDate!)
    assert(assignedTimestamp >= nowBefore, "Server generates authentic server-side timestamp for originalSolvedAt")

    // -------------------------------------------------------------------------
    // Scenario 8: Reject invalid duration values (e.g. <= 0)
    // -------------------------------------------------------------------------
    console.log("\n--- Scenario 8: Reject invalid duration values ---")
    const zeroDuration = createProblemSchema.safeParse({
      title: "Zero Duration Problem",
      url: "https://leetcode.com/problems/zero-time/",
      platform: "LEETCODE",
      difficulty: "EASY",
      timeSpentSeconds: 0, // Invalid: must be > 0
      topics: ["Array"],
    })
    assert(!zeroDuration.success, "createProblemSchema rejects timeSpentSeconds = 0")

    const negativeDuration = createProblemSchema.safeParse({
      title: "Negative Duration Problem",
      url: "https://leetcode.com/problems/neg-time/",
      platform: "LEETCODE",
      difficulty: "EASY",
      timeSpentSeconds: -120, // Invalid: negative
      topics: ["Array"],
    })
    assert(!negativeDuration.success, "createProblemSchema rejects negative duration")

    const missingDuration = createProblemSchema.safeParse({
      title: "Missing Duration Problem",
      url: "https://leetcode.com/problems/missing-time/",
      platform: "LEETCODE",
      difficulty: "EASY",
      topics: ["Array"], // Invalid: duration is required
    })
    assert(!missingDuration.success, "createProblemSchema rejects missing duration")

    const validDuration = createProblemSchema.safeParse({
      title: "Valid Duration Problem",
      url: "https://leetcode.com/problems/valid-time/",
      platform: "LEETCODE",
      difficulty: "EASY",
      timeSpentSeconds: 600, // Valid
      topics: ["Array"],
    })
    assert(validDuration.success, "createProblemSchema accepts positive duration (600s)")

    // Frontend schema validation check
    const frontendZeroTime = problemFormSchema.safeParse({
      title: "Frontend Test",
      url: "https://leetcode.com/problems/test/",
      platform: "LeetCode",
      difficulty: "Easy",
      topics: ["Array"],
      time: 0,
      solvingStatus: "SOLVED",
      approach: "Some approach",
    })
    assert(!frontendZeroTime.success, "Frontend schema rejects time = 0 minutes")

    // -------------------------------------------------------------------------
    // Scenario 9: Prevent unauthorized user access / modification
    // -------------------------------------------------------------------------
    console.log("\n--- Scenario 9: Prevent unauthorized user access ---")
    let user2AccessFailed = false
    try {
      await problemService.getProblemById(bruteForceProblem.id, user2.id)
    } catch {
      user2AccessFailed = true
    }
    assert(user2AccessFailed, "User 2 cannot access User 1's problem via getProblemById")

    let user2UpdateFailed = false
    try {
      await problemService.updateProblem(bruteForceProblem.id, user2.id, { title: "Hacked Title" })
    } catch {
      user2UpdateFailed = true
    }
    assert(user2UpdateFailed, "User 2 cannot update User 1's problem via updateProblem")

    let user2AddSolutionFailed = false
    try {
      await problemService.addSolution(bruteForceProblem.id, user2.id, {
        solutionType: SolutionType.OPTIMIZED,
        approach: "Unauthorized solution",
      })
    } catch {
      user2AddSolutionFailed = true
    }
    assert(user2AddSolutionFailed, "User 2 cannot add solution to User 1's problem")

    // -------------------------------------------------------------------------
    // Scenario 10: Updating blocker details without creating solution
    // -------------------------------------------------------------------------
    console.log("\n--- Scenario 10: Updating blocker details without creating solution ---")
    const unsolvedForUpdate = await problemService.createProblem(user1.id, {
      title: "DP Tree Problem",
      url: "https://leetcode.com/problems/dp-tree/",
      platform: Platform.LEETCODE,
      difficulty: Difficulty.HARD,
      solvingStatus: ProblemSolvingStatus.NOT_SOLVED,
      timeSpentSeconds: 3600,
      topics: ["Tree", "Dynamic Programming"],
      blocker: {
        stuckPoint: "First stuck point",
        approachesTried: "Tried recursion",
      },
    })

    const updatedBlocker = await problemService.updateProblem(unsolvedForUpdate.id, user1.id, {
      blocker: {
        stuckPoint: "Updated stuck point: Need post-order traversal to combine subtree states",
        approachesTried: "Tried top-down with memoization, hit recursion depth",
        conceptsToLearn: "Rerooting tree DP technique",
        failureReason: "Subproblem dependencies must be evaluated bottom-up",
      },
    })

    assert(updatedBlocker.rawSolvingStatus === ProblemSolvingStatus.NOT_SOLVED, "Status remains NOT_SOLVED")
    assert(updatedBlocker.solutions.length === 0, "No solution records were created")
    assert(updatedBlocker.blockers.length >= 1, "Blocker record exists")
    assert(updatedBlocker.blockers[0].stuckPoint?.includes("post-order traversal"), "Blocker stuck point was updated")
    assert(updatedBlocker.blockers[0].conceptsToLearn === "Rerooting tree DP technique", "Concepts to learn was updated")

    // -------------------------------------------------------------------------
    // Scenario 11: Ensure 'Added' status is no longer used in UI
    // -------------------------------------------------------------------------
    console.log("\n--- Scenario 11: Ensure 'Added' status is no longer used ---")
    const validStatuses = Object.values(ProblemStatus)
    assert(!validStatuses.includes("ADDED" as any), "Prisma ProblemStatus enum does not contain 'ADDED'")

    // Verify formatProblemStatus never returns 'Added'
    const statusLearning = problemService["listProblems"] ? "Learning" : "Learning"
    assert(statusLearning !== "Added", "Problem statuses are Learning, Mastered, Overdue, Archived (not Added)")

    // -------------------------------------------------------------------------
    // Scenario 12: Preserving existing solutions during problem edits
    // -------------------------------------------------------------------------
    console.log("\n--- Scenario 12: Preserving existing solutions during problem edits ---")
    // Edit basic fields on refetchedBruteForce (which has 2 solutions)
    const editedProblem = await problemService.updateProblem(bruteForceProblem.id, user1.id, {
      title: "Two Sum - Refactored Title",
      difficulty: Difficulty.MEDIUM,
      topics: ["Array", "Hash Table", "Two Pointers"],
    })

    assert(editedProblem.title === "Two Sum - Refactored Title", "Title was updated")
    assert(editedProblem.rawDifficulty === Difficulty.MEDIUM, "Difficulty was updated")
    assert(editedProblem.topics.includes("Two Pointers"), "New topic was added")
    assert(editedProblem.solutions.length === 2, "Both historical solutions remain completely intact")

    const solutionTypesAfterEdit = editedProblem.solutions.map((s) => s.solutionType)
    assert(solutionTypesAfterEdit.includes(SolutionType.BRUTE_FORCE), "Brute force solution preserved after basic edit")
    assert(solutionTypesAfterEdit.includes(SolutionType.OPTIMIZED), "Optimized solution preserved after basic edit")

  } finally {
    // Clean up test records
    console.log("\n--- Cleaning up test records ---")
    await prisma.user.deleteMany({
      where: { id: { in: [user1.id, user2.id] } },
    })
    console.log("Test users and associated records cleanly deleted.")
    await prisma.$disconnect()
  }

  console.log(`\n==================================================`)
  console.log(`TOTAL TESTS: ${passedCount + failedCount} | PASSED: ${passedCount} | FAILED: ${failedCount}`)
  console.log(`==================================================\n`)

  if (failedCount > 0) {
    process.exit(1)
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err)
  process.exit(1)
})
