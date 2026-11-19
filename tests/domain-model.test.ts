import { PrismaClient, Difficulty, Platform, ProblemSolvingStatus, ProblemStatus, SolutionType, RevisionRating, RevisionStatus } from "@prisma/client"
import { problemRepository } from "../src/server/repositories/problem.repository"
import { problemService } from "../src/server/services/problem.service"

const prisma = new PrismaClient()

async function runTests() {
  console.log("=== RUNNING DOMAIN MODEL VERIFICATION TESTS ===\n")
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
  const testEmail1 = `test-user-1-${Date.now()}@example.com`
  const testEmail2 = `test-user-2-${Date.now()}@example.com`

  const user1 = await prisma.user.create({
    data: {
      email: testEmail1,
      name: "Domain Test User 1",
    },
  })

  const user2 = await prisma.user.create({
    data: {
      email: testEmail2,
      name: "Domain Test User 2",
    },
  })

  try {
    // -------------------------------------------------------------------------
    // Scenario 1: A problem can exist as NOT_SOLVED without revision records
    // -------------------------------------------------------------------------
    console.log("\n--- Scenario 1: Unsolved Problem in Backlog ---")
    const unsolvedProblem = await problemService.createProblem(user1.id, {
      title: "Hard Graph Problem",
      url: "https://leetcode.com/problems/hard-graph/",
      platform: Platform.LEETCODE,
      difficulty: Difficulty.HARD,
      solvingStatus: ProblemSolvingStatus.NOT_SOLVED,
      timeSpentSeconds: 2700,
      topics: ["Graph", "BFS"],
      blocker: {
        stuckPoint: "Unable to find topological order with cycles",
        approachesTried: "Tried standard Kahn algorithm",
        conceptsToLearn: "Tarjan strongly connected components",
        failureReason: "Infinite loop on cyclic components",
      },
    })

    assert(unsolvedProblem.rawSolvingStatus === ProblemSolvingStatus.NOT_SOLVED, "Problem solving status is NOT_SOLVED")
    assert(unsolvedProblem.revisions.length === 0, "NOT_SOLVED problem has no revision records scheduled")
    assert(unsolvedProblem.originalSolveDate === null, "NOT_SOLVED problem has no originalSolveDate")
    assert(unsolvedProblem.initialSolveDurationSeconds === null, "initialSolveDurationSeconds is null for unsolved problem")
    assert(unsolvedProblem.timeSpentSeconds === 2700, "timeSpentSeconds accurately records time spent attempting (2700s)")
    assert(unsolvedProblem.nextRevision === "Unsolved", "nextRevision indicates 'Unsolved' (not Due Today or Overdue)")
    assert(unsolvedProblem.blockers.length === 1, "Blocker learning details are recorded independently")
    assert(unsolvedProblem.blockers[0].stuckPoint === "Unable to find topological order with cycles", "Blocker stuckPoint matches")

    // -------------------------------------------------------------------------
    // Scenario 2: A solved problem can have a brute-force solution
    // -------------------------------------------------------------------------
    console.log("\n--- Scenario 2: Solved Problem with Brute-Force Solution ---")
    const solvedProblem = await problemService.createProblem(user1.id, {
      title: "3Sum Problem",
      url: "https://leetcode.com/problems/3sum/",
      platform: Platform.LEETCODE,
      difficulty: Difficulty.MEDIUM,
      solvingStatus: ProblemSolvingStatus.SOLVED,
      timeSpentSeconds: 1500,
      topics: ["Array", "Two Pointers"],
      solution: {
        solutionType: SolutionType.BRUTE_FORCE,
        approach: "Three nested loops checking every triplet sum",
        timeComplexity: "O(n^3)",
        spaceComplexity: "O(1)",
        improvementNotes: "Can sort first and use two pointers to achieve O(n^2)",
      },
    })

    assert(solvedProblem.rawSolvingStatus === ProblemSolvingStatus.SOLVED, "Problem solving status is SOLVED")
    assert(solvedProblem.originalSolveDate !== null, "SOLVED problem has an original solve timestamp")
    assert(solvedProblem.solutions.length === 1, "Problem has exactly 1 solution record")
    assert(solvedProblem.solutions[0].solutionType === SolutionType.BRUTE_FORCE, "Solution type is BRUTE_FORCE")
    assert(solvedProblem.solutions[0].timeComplexity === "O(n^3)", "Solution time complexity is O(n^3)")

    // -------------------------------------------------------------------------
    // Scenario 3: An optimized solution can be added without deleting brute-force
    // -------------------------------------------------------------------------
    console.log("\n--- Scenario 3: Add Optimized Solution without Overwriting ---")
    const optimizedSolution = await problemService.addSolution(solvedProblem.id, user1.id, {
      solutionType: SolutionType.OPTIMIZED,
      approach: "Sort array and use two pointers for remaining two elements with duplicate skipping",
      timeComplexity: "O(n^2)",
      spaceComplexity: "O(1)",
      improvementNotes: "Optimal time complexity achieved",
    })

    assert(optimizedSolution !== null, "addSolution returned created record")

    // Retrieve problem and verify both solutions exist
    const problemWithBothSolutions = await problemService.getProblemById(solvedProblem.id, user1.id)
    assert(problemWithBothSolutions.solutions.length === 2, "Problem now contains 2 independent solutions")
    const types = problemWithBothSolutions.solutions.map((s) => s.solutionType)
    assert(types.includes(SolutionType.BRUTE_FORCE) && types.includes(SolutionType.OPTIMIZED), "Both BRUTE_FORCE and OPTIMIZED solutions are preserved")
    const bruteForce = problemWithBothSolutions.solutions.find((s) => s.solutionType === SolutionType.BRUTE_FORCE)
    assert(bruteForce?.timeComplexity === "O(n^3)", "Brute force solution record was untouched and preserved")

    // -------------------------------------------------------------------------
    // Scenario 4 & 5: Multiple Revision Cycles & Historical Records Intact
    // -------------------------------------------------------------------------
    console.log("\n--- Scenario 4 & 5: Revision Cycles & History Preservation ---")
    // Cycle 1: Revision 1
    const rev1Cycle1 = await prisma.revision.create({
      data: {
        problemId: solvedProblem.id,
        cycleNumber: 1,
        revisionNumber: 1,
        scheduledAt: new Date(Date.now() - 86400000 * 5),
        completedAt: new Date(Date.now() - 86400000 * 5),
        status: RevisionStatus.COMPLETED,
        rating: RevisionRating.GOOD,
      },
    })

    // Cycle 1: Revision 2 (marked Difficult / Not Solved -> triggers cycle restart)
    const rev2Cycle1 = await prisma.revision.create({
      data: {
        problemId: solvedProblem.id,
        cycleNumber: 1,
        revisionNumber: 2,
        scheduledAt: new Date(Date.now() - 86400000 * 2),
        completedAt: new Date(Date.now() - 86400000 * 2),
        status: RevisionStatus.COMPLETED,
        rating: RevisionRating.DIFFICULT,
      },
    })

    // Log an attempt during Cycle 1
    const attemptCycle1 = await prisma.attempt.create({
      data: {
        problemId: solvedProblem.id,
        revisionId: rev2Cycle1.id,
        cycleNumber: 1,
        durationSeconds: 900,
      },
    })

    // Start Cycle 2: A new Revision 1 scheduled
    await prisma.problem.update({
      where: { id: solvedProblem.id },
      data: { currentCycle: 2 },
    })

    const rev1Cycle2 = await prisma.revision.create({
      data: {
        problemId: solvedProblem.id,
        cycleNumber: 2,
        revisionNumber: 1,
        scheduledAt: new Date(Date.now() + 86400000),
        status: RevisionStatus.PENDING,
      },
    })

    // Log an attempt during Cycle 2
    const attemptCycle2 = await prisma.attempt.create({
      data: {
        problemId: solvedProblem.id,
        revisionId: rev1Cycle2.id,
        cycleNumber: 2,
        durationSeconds: 600,
      },
    })

    // Verify all records exist and cycle numbers are distinguished
    const allRevisions = await prisma.revision.findMany({
      where: { problemId: solvedProblem.id },
      orderBy: [{ cycleNumber: "asc" }, { revisionNumber: "asc" }],
    })

    assert(allRevisions.length === 3, "All 3 revision records across cycles are preserved")
    assert(allRevisions[0].cycleNumber === 1 && allRevisions[0].revisionNumber === 1, "Cycle 1 Rev 1 preserved")
    assert(allRevisions[1].cycleNumber === 1 && allRevisions[1].revisionNumber === 2, "Cycle 1 Rev 2 preserved")
    assert(allRevisions[2].cycleNumber === 2 && allRevisions[2].revisionNumber === 1, "Cycle 2 Rev 1 scheduled independently")

    const allAttempts = await prisma.attempt.findMany({
      where: { problemId: solvedProblem.id },
      orderBy: { cycleNumber: "asc" },
    })
    assert(allAttempts.length === 2, "Both attempts across cycles are preserved")
    assert(allAttempts[0].cycleNumber === 1, "Attempt 1 linked to cycle 1")
    assert(allAttempts[1].cycleNumber === 2, "Attempt 2 linked to cycle 2")

    // Verify unique constraint: duplicate (problemId, cycleNumber, revisionNumber) is prevented
    let uniqueConstraintFailed = false
    try {
      await prisma.revision.create({
        data: {
          problemId: solvedProblem.id,
          cycleNumber: 1,
          revisionNumber: 1, // Already exists for cycle 1
          scheduledAt: new Date(),
        },
      })
    } catch (e) {
      uniqueConstraintFailed = true
    }
    assert(uniqueConstraintFailed, "Unique constraint enforces unique revision numbers within each cycle")

    // -------------------------------------------------------------------------
    // Scenario 6: Manual Mastery independent of revision completion
    // -------------------------------------------------------------------------
    console.log("\n--- Scenario 6: Manual Mastery Independence ---")
    const masteredProblem = await problemRepository.markMastered(solvedProblem.id, user1.id)
    assert(masteredProblem?.isMastered === true, "Problem is marked as mastered")
    assert(masteredProblem?.masteredAt !== null, "masteredAt timestamp is recorded")
    assert(masteredProblem?.revisions.length === 3, "Completed and pending revisions remain fully intact after mastery")
    assert(masteredProblem?.attempts.length === 2, "Historical attempts remain intact after mastery")

    // -------------------------------------------------------------------------
    // Scenario 7: Unmark Mastery without destroying history
    // -------------------------------------------------------------------------
    console.log("\n--- Scenario 7: Unmark Mastery ---")
    const unmasteredProblem = await problemRepository.unmarkMastered(solvedProblem.id, user1.id)
    assert(unmasteredProblem?.isMastered === false, "Problem is unmastered")
    assert(unmasteredProblem?.masteredAt === null, "masteredAt is cleared")
    assert(unmasteredProblem?.revisions.length === 3, "Historical revisions preserved after unmastering")
    assert(unmasteredProblem?.attempts.length === 2, "Historical attempts preserved after unmastering")

    // -------------------------------------------------------------------------
    // Scenario 8: User ownership strictly enforced
    // -------------------------------------------------------------------------
    console.log("\n--- Scenario 8: Strict User Ownership Isolation ---")
    // User 2 cannot find User 1's problem
    const unauthorizedFind = await problemRepository.findById(solvedProblem.id, user2.id)
    assert(unauthorizedFind === null, "User 2 cannot access User 1's problem via findById")

    // User 2 cannot add solution to User 1's problem
    const unauthorizedAddSolution = await problemRepository.addSolution(solvedProblem.id, user2.id, {
      solutionType: SolutionType.OPTIMIZED,
      approach: "Unauthorized solution",
    })
    assert(unauthorizedAddSolution === null, "User 2 cannot add solution to User 1's problem")

    // User 2 cannot add blocker to User 1's problem
    const unauthorizedAddBlocker = await problemRepository.addBlocker(unsolvedProblem.id, user2.id, {
      stuckPoint: "Unauthorized blocker",
    })
    assert(unauthorizedAddBlocker === null, "User 2 cannot add blocker to User 1's problem")

    // User 2 cannot mark User 1's problem mastered
    const unauthorizedMaster = await problemRepository.markMastered(solvedProblem.id, user2.id)
    assert(unauthorizedMaster === null, "User 2 cannot mark User 1's problem as mastered")

    // User 2 listing problems returns 0 problems
    const user2Problems = await problemRepository.findMany(user2.id, {})
    assert(user2Problems.items.length === 0, "User 2 listing returns only User 2's problems (0 items)")

  } finally {
    // Cleanup test data safely
    console.log("\n--- Cleaning up test records ---")
    await prisma.user.deleteMany({
      where: {
        id: { in: [user1.id, user2.id] },
      },
    })
    console.log("Test users and associated cascading records removed.")
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
