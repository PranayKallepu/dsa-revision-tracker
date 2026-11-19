import { z } from "zod"
import {
  TIME_COMPLEXITIES,
  TIME_COMPLEXITY_OPTIONS,
  type TimeComplexity,
  SPACE_COMPLEXITIES,
  SPACE_COMPLEXITY_OPTIONS,
  type SpaceComplexity,
} from "@/types/problem"

export {
  TIME_COMPLEXITIES,
  TIME_COMPLEXITY_OPTIONS,
  type TimeComplexity,
  SPACE_COMPLEXITIES,
  SPACE_COMPLEXITY_OPTIONS,
  type SpaceComplexity,
}

export const PLATFORMS = [
  "LeetCode",
  "GeeksforGeeks",
  "HackerRank",
  "Codeforces",
  "InterviewBit",
  "Other",
] as const

export const DIFFICULTIES = ["Easy", "Medium", "Hard"] as const

export const COMMON_TOPICS = [
  "Array",
  "String",
  "Hash Map",
  "Two Pointers",
  "Sliding Window",
  "Binary Search",
  "Linked List",
  "Stack",
  "Queue",
  "Tree",
  "Binary Search Tree",
  "Graph",
  "DFS",
  "BFS",
  "Heap",
  "Recursion",
  "Backtracking",
  "Dynamic Programming",
  "Greedy",
  "Bit Manipulation",
  "Trie",
  "Topological Sort",
] as const

export const problemFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Problem title is required")
      .max(200, "Title must be under 200 characters"),
    url: z
      .string()
      .trim()
      .min(1, "Problem URL is required")
      .refine((val) => {
        try {
          const testUrl =
            val.startsWith("http://") || val.startsWith("https://")
              ? val
              : `https://${val}`
          const parsed = new URL(testUrl)
          return parsed.hostname.includes(".")
        } catch {
          return false
        }
      }, "Please enter a valid URL (e.g. https://leetcode.com/problems/...)"),
    platform: z.string().min(1, "Platform selection is required"),
    difficulty: z.enum(DIFFICULTIES, {
      message: "Difficulty must be Easy, Medium, or Hard",
    }),
    topics: z
      .array(z.string())
      .min(1, "Please select or add at least one topic tag"),
    time: z.coerce
      .number({ message: "Time spent must be a valid number" })
      .positive("Time spent must be greater than 0 minutes")
      .max(1440, "Duration seems excessively high (max 1440 mins)"),
    solvingStatus: z.enum(["SOLVED", "NOT_SOLVED"]).default("SOLVED"),
    solutionType: z.enum(["BRUTE_FORCE", "OPTIMIZED"]).optional().default("BRUTE_FORCE"),
    approach: z.string().optional().default(""),
    timeComplexity: z.string().optional().default(""),
    spaceComplexity: z.string().optional().default(""),
    improvementNotes: z.string().optional().default(""),
    notes: z.string().optional().default(""),
    mistakes: z.string().optional().default(""),
    stuckPoint: z.string().optional().default(""),
    approachesTried: z.string().optional().default(""),
    conceptsToLearn: z.string().optional().default(""),
    failureReason: z.string().optional().default(""),
  })
  .superRefine((data, ctx) => {
    if (data.solvingStatus === "SOLVED") {
      if (!data.approach || data.approach.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Approach explanation is required for solved problems",
          path: ["approach"],
        })
      }
    }
  })

export type ProblemFormValues = z.infer<typeof problemFormSchema>

/**
 * Automatically derive the platform from a given URL.
 */
export function derivePlatformFromUrl(
  rawUrl: string,
): typeof PLATFORMS[number] | null {
  if (!rawUrl) return null
  const lower = rawUrl.toLowerCase()
  if (lower.includes("leetcode.com")) return "LeetCode"
  if (lower.includes("geeksforgeeks.org") || lower.includes("gfg.org"))
    return "GeeksforGeeks"
  if (lower.includes("hackerrank.com")) return "HackerRank"
  if (lower.includes("codeforces.com")) return "Codeforces"
  if (lower.includes("interviewbit.com")) return "InterviewBit"
  return null
}
