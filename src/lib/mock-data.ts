import type {
  ActivityItem,
  Difficulty,
  Problem,
  ProblemStatus,
  UpcomingDay,
} from "@/types"

export type { Difficulty, ProblemStatus, Problem }

export const problems: Problem[] = [
  {
    id: 1,
    title: "Longest Substring Without Repeating Characters",
    url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
    difficulty: "Medium",
    platform: "LeetCode",
    topics: ["Sliding Window", "Hash Map"],
    status: "Overdue",
    nextRevision: "Today",
    revision: 3,
    time: 28,
    approach:
      "Use a sliding window with a hash map storing the latest index of each character. When a repeated character appears inside the current window, move the left pointer just beyond its previous position.\n\nKey formula:\nleft = max(left, lastSeen[char] + 1)\nmaxLength = max(maxLength, right - left + 1)",
    timeComplexity: "O(n)",
    spaceComplexity: "O(min(n, m))",
    notes:
      "Watch out for 1-based vs 0-based indices. Ensure hash map updates the latest index on every character encounter.",
    mistakes:
      "Initially moved the left pointer backwards when encountering duplicate characters outside the current active sliding window.",
    lastRevisionDate: "Jun 5",
    attempts: [
      {
        id: "1-3",
        date: "Today",
        timeSpent: 28,
        rating: "Difficult",
        notes: "Needed hint for pointer adjustment",
      },
      {
        id: "1-2",
        date: "Jun 5",
        timeSpent: 24,
        rating: "Good",
        notes: "Clean solution using dictionary",
      },
      {
        id: "1-1",
        date: "Jun 2",
        timeSpent: 36,
        rating: "Good",
        notes: "First attempt at sliding window approach",
      },
      {
        id: "1-0",
        date: "May 31",
        timeSpent: 48,
        rating: "Forgot",
        notes: "Struggled with window bounds",
      },
    ],
  },
  {
    id: 2,
    title: "Merge K Sorted Lists",
    url: "https://leetcode.com/problems/merge-k-sorted-lists/",
    difficulty: "Hard",
    platform: "LeetCode",
    topics: ["Heap", "Linked List"],
    status: "Learning",
    nextRevision: "Today",
    revision: 2,
    time: 42,
    approach:
      "Initialize a min-heap with the head node of each linked list. Repeatedly extract the minimum node from the heap, attach it to the merged list result, and push the next node from that list into the heap until the heap is empty.",
    timeComplexity: "O(N log k)",
    spaceComplexity: "O(k)",
    notes:
      "k is the number of linked lists, and N is the total number of nodes across all lists. Divide and conquer also works in O(N log k) with O(1) extra space.",
    mistakes:
      "Failed to handle empty lists in the input array during initial heap insertion.",
    lastRevisionDate: "Jun 4",
    attempts: [
      {
        id: "2-2",
        date: "Jun 4",
        timeSpent: 42,
        rating: "Difficult",
        notes: "Heap comparator edge case in JavaScript",
      },
      {
        id: "2-1",
        date: "May 28",
        timeSpent: 55,
        rating: "Good",
        notes: "Initial solve using min-heap",
      },
    ],
  },
  {
    id: 3,
    title: "Number of Islands",
    url: "https://leetcode.com/problems/number-of-islands/",
    difficulty: "Medium",
    platform: "LeetCode",
    topics: ["Graph", "DFS"],
    status: "Learning",
    nextRevision: "Tomorrow",
    revision: 4,
    time: 24,
    approach:
      "Iterate through each cell in the 2D grid. When an unvisited '1' (land) is found, increment the island count and trigger a depth-first search (or BFS) to sink/mark all horizontally and vertically connected land cells as visited.",
    timeComplexity: "O(M * N)",
    spaceComplexity: "O(M * N)",
    notes:
      "Can modify the input grid in-place by marking visited cells as '0' to avoid using an auxiliary visited set.",
    mistakes:
      "Missed boundary checks on grid edges (row < 0 || col < 0) before accessing cells, causing out-of-bounds error.",
    lastRevisionDate: "Today",
    attempts: [
      {
        id: "3-4",
        date: "Today",
        timeSpent: 22,
        rating: "Good",
        notes: "Sunk cells in-place without auxiliary memory",
      },
      {
        id: "3-3",
        date: "Jun 3",
        timeSpent: 26,
        rating: "Good",
        notes: "Iterative BFS version",
      },
      {
        id: "3-2",
        date: "May 25",
        timeSpent: 30,
        rating: "Good",
        notes: "Recursive DFS",
      },
    ],
  },
  {
    id: 4,
    title: "Two Sum",
    url: "https://leetcode.com/problems/two-sum/",
    difficulty: "Easy",
    platform: "LeetCode",
    topics: ["Array", "Hash Map"],
    status: "Mastered",
    nextRevision: "Jun 28",
    revision: 6,
    time: 8,
    approach:
      "Maintain a hash map mapping each seen number to its index. For each element x in the array, check if target - x already exists in the map. If yes, return the pair of indices; otherwise, store x in the map.",
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    notes:
      "Guaranteed exactly one solution exists, and the same element may not be used twice.",
    mistakes:
      "Using the same element twice when target = 2 * nums[i] if checked before inserting.",
    lastRevisionDate: "Jun 6",
    attempts: [
      {
        id: "4-3",
        date: "Jun 6",
        timeSpent: 8,
        rating: "Easy",
        notes: "Mastered one-pass hash map",
      },
      {
        id: "4-2",
        date: "May 20",
        timeSpent: 10,
        rating: "Good",
        notes: "Flawless speed run",
      },
    ],
  },
  {
    id: 5,
    title: "Allocate Minimum Pages",
    url: "https://geeksforgeeks.org/allocate-minimum-pages",
    difficulty: "Hard",
    platform: "GeeksforGeeks",
    topics: ["Binary Search"],
    status: "Learning",
    nextRevision: "Jun 12",
    revision: 1,
    time: 38,
    approach:
      "Binary search on the answer space [max(pages), sum(pages)]. In each step, verify with a greedy helper whether pages can be allocated to m students such that no student gets more than mid pages.",
    timeComplexity: "O(n log(sum - max))",
    spaceComplexity: "O(1)",
    notes:
      "Essential pattern for 'Minimax' optimization problems using binary search on answer.",
    mistakes:
      "Initial lower bound was set to 0 instead of max(pages[i]), which led to invalid allocations.",
    lastRevisionDate: "Jun 2",
    attempts: [
      {
        id: "5-1",
        date: "Jun 2",
        timeSpent: 38,
        rating: "Difficult",
        notes: "Challenging greedy allocation predicate",
      },
    ],
  },
  {
    id: 6,
    title: "Course Schedule",
    url: "https://leetcode.com/problems/course-schedule/",
    difficulty: "Medium",
    platform: "LeetCode",
    topics: ["Graph", "Topological Sort"],
    status: "Learning",
    nextRevision: "Jun 15",
    revision: 3,
    time: 31,
    approach:
      "Model courses as a directed graph. Detect cycle using Kahn's algorithm (BFS with in-degree array) or 3-state DFS (unvisited, visiting, visited). If topological sort includes all courses, scheduling is possible.",
    timeComplexity: "O(V + E)",
    spaceComplexity: "O(V + E)",
    notes:
      "In-degree array + queue BFS approach is generally easier to write and less prone to recursion stack limits.",
    mistakes:
      "Confused prerequisite directions (u -> v vs v -> u), reversing the graph edges.",
    lastRevisionDate: "Jun 5",
    attempts: [
      {
        id: "6-3",
        date: "Jun 5",
        timeSpent: 31,
        rating: "Difficult",
        notes: "Cycle detection with 3-state DFS",
      },
      {
        id: "6-2",
        date: "May 27",
        timeSpent: 35,
        rating: "Good",
        notes: "Kahn's BFS in-degree",
      },
    ],
  },
  {
    id: 7,
    title: "Valid Parentheses",
    url: "https://leetcode.com/problems/valid-parentheses/",
    difficulty: "Easy",
    platform: "LeetCode",
    topics: ["Stack", "String"],
    status: "Archived",
    nextRevision: "—",
    revision: 2,
    time: 11,
    approach:
      "Push opening brackets onto a stack. When a closing bracket is seen, pop the top of the stack and ensure it matches the corresponding opening bracket. Stack must be empty at the end.",
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    notes:
      "Use a map from closing bracket to opening bracket for concise condition checks.",
    mistakes:
      "Popping from an empty stack when string begins with a closing bracket.",
    lastRevisionDate: "Jun 3",
    attempts: [
      {
        id: "7-2",
        date: "Jun 3",
        timeSpent: 11,
        rating: "Easy",
        notes: "Clean stack implementation",
      },
    ],
  },
]

export const upcoming: UpcomingDay[] = [
  { day: "Today", date: "08", count: 5, active: true },
  { day: "Mon", date: "09", count: 3 },
  { day: "Tue", date: "10", count: 2 },
  { day: "Wed", date: "11", count: 6 },
  { day: "Thu", date: "12", count: 1 },
  { day: "Fri", date: "13", count: 4 },
  { day: "Sat", date: "14", count: 2 },
]

export const activities: ActivityItem[] = [
  {
    action: "Revision completed",
    problem: "Number of Islands",
    detail: "Rated Good · 22 min",
    time: "Today, 9:42 AM",
    tone: "success",
  },
  {
    action: "Problem added",
    problem: "Merge K Sorted Lists",
    detail: "Hard · Heap",
    time: "Yesterday, 6:18 PM",
    tone: "primary",
  },
  {
    action: "Mastery test passed",
    problem: "Two Sum",
    detail: "Solved in 8 min",
    time: "Jun 6, 11:20 AM",
    tone: "success",
  },
  {
    action: "Revision rescheduled",
    problem: "Course Schedule",
    detail: "Rated Difficult · Restarts tomorrow",
    time: "Jun 5, 8:03 PM",
    tone: "warning",
  },
  {
    action: "Problem archived",
    problem: "Valid Parentheses",
    detail: "Removed from active queue",
    time: "Jun 3, 2:15 PM",
    tone: "neutral",
  },
]
