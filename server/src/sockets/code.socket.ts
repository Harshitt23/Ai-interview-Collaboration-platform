import { Server, Socket } from "socket.io";

interface JoinRoomPayload {
  roomId: string;
}

interface CodeChangePayload {
  roomId: string;
  code: string;
}

interface StartInterviewPayload {
  roomId: string;
  duration?: number; // seconds, default 2700 (45 min)
}

interface ChatMessagePayload {
  roomId: string;
  text: string;
}

interface RoomTimer {
  startedAt: number;
  duration: number;
}

export interface Problem {
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  description: string;
  examples: { input: string; output: string; explanation?: string }[];
  constraints: string[];
}

const PROBLEMS: Problem[] = [
  {
    title: "Two Sum",
    difficulty: "Easy",
    description:
      "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
    examples: [
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "nums[0] + nums[1] = 2 + 7 = 9" },
      { input: "nums = [3,2,4], target = 6", output: "[1,2]" },
    ],
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists.",
    ],
  },
  {
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    description:
      "Given a string s, find the length of the longest substring without repeating characters.",
    examples: [
      { input: 's = "abcabcbb"', output: "3", explanation: 'The answer is "abc", with length 3.' },
      { input: 's = "bbbbb"', output: "1", explanation: 'The answer is "b", with length 1.' },
      { input: 's = "pwwkew"', output: "3", explanation: 'The answer is "wke", with length 3.' },
    ],
    constraints: [
      "0 <= s.length <= 5 * 10^4",
      "s consists of English letters, digits, symbols and spaces.",
    ],
  },
  {
    title: "Valid Parentheses",
    difficulty: "Easy",
    description:
      "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if: open brackets must be closed by the same type of brackets, and open brackets must be closed in the correct order.",
    examples: [
      { input: 's = "()"', output: "true" },
      { input: 's = "()[]{}"', output: "true" },
      { input: 's = "(]"', output: "false" },
    ],
    constraints: [
      "1 <= s.length <= 10^4",
      "s consists of parentheses only '()[]{}'.",
    ],
  },
  {
    title: "Maximum Subarray",
    difficulty: "Medium",
    description:
      "Given an integer array nums, find the subarray with the largest sum, and return its sum.",
    examples: [
      { input: "nums = [-2,1,-3,4,-1,2,1,-5,4]", output: "6", explanation: "The subarray [4,-1,2,1] has the largest sum 6." },
      { input: "nums = [1]", output: "1" },
      { input: "nums = [5,4,-1,7,8]", output: "23" },
    ],
    constraints: [
      "1 <= nums.length <= 10^5",
      "-10^4 <= nums[i] <= 10^4",
    ],
  },
  {
    title: "Climbing Stairs",
    difficulty: "Easy",
    description:
      "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
    examples: [
      { input: "n = 2", output: "2", explanation: "There are two ways: 1+1 or 2." },
      { input: "n = 3", output: "3", explanation: "There are three ways: 1+1+1, 1+2, or 2+1." },
    ],
    constraints: ["1 <= n <= 45"],
  },
  {
    title: "Merge Intervals",
    difficulty: "Medium",
    description:
      "Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.",
    examples: [
      { input: "intervals = [[1,3],[2,6],[8,10],[15,18]]", output: "[[1,6],[8,10],[15,18]]", explanation: "Intervals [1,3] and [2,6] overlap, merge to [1,6]." },
      { input: "intervals = [[1,4],[4,5]]", output: "[[1,5]]", explanation: "Intervals [1,4] and [4,5] are considered overlapping." },
    ],
    constraints: [
      "1 <= intervals.length <= 10^4",
      "intervals[i].length == 2",
      "0 <= starti <= endi <= 10^4",
    ],
  },
  {
    title: "Binary Search",
    difficulty: "Easy",
    description:
      "Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1. You must write an algorithm with O(log n) runtime complexity.",
    examples: [
      { input: "nums = [-1,0,3,5,9,12], target = 9", output: "4", explanation: "9 exists in nums and its index is 4." },
      { input: "nums = [-1,0,3,5,9,12], target = 2", output: "-1", explanation: "2 does not exist in nums so return -1." },
    ],
    constraints: [
      "1 <= nums.length <= 10^4",
      "-10^4 < nums[i], target < 10^4",
      "All integers in nums are unique.",
      "nums is sorted in ascending order.",
    ],
  },
  {
    title: "Number of Islands",
    difficulty: "Medium",
    description:
      "Given an m x n 2D binary grid which represents a map of '1's (land) and '0's (water), return the number of islands. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.",
    examples: [
      {
        input: 'grid = [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]',
        output: "1",
      },
      {
        input: 'grid = [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]',
        output: "3",
      },
    ],
    constraints: [
      "m == grid.length",
      "n == grid[i].length",
      "1 <= m, n <= 300",
      "grid[i][j] is '0' or '1'.",
    ],
  },
  {
    title: "Coin Change",
    difficulty: "Medium",
    description:
      "You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money. Return the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return -1.",
    examples: [
      { input: "coins = [1,5,11,15,25], amount = 30", output: "2", explanation: "25 + 5 = 30, 2 coins." },
      { input: "coins = [2], amount = 3", output: "-1" },
      { input: "coins = [1], amount = 0", output: "0" },
    ],
    constraints: [
      "1 <= coins.length <= 12",
      "1 <= coins[i] <= 2^31 - 1",
      "0 <= amount <= 10^4",
    ],
  },
  {
    title: "Reverse Linked List",
    difficulty: "Easy",
    description:
      "Given the head of a singly linked list, reverse the list, and return the reversed list.",
    examples: [
      { input: "head = [1,2,3,4,5]", output: "[5,4,3,2,1]" },
      { input: "head = [1,2]", output: "[2,1]" },
      { input: "head = []", output: "[]" },
    ],
    constraints: [
      "The number of nodes in the list is in the range [0, 5000].",
      "-5000 <= Node.val <= 5000",
    ],
  },
  {
    title: "Validate Binary Search Tree",
    difficulty: "Medium",
    description:
      "Given the root of a binary tree, determine if it is a valid binary search tree (BST). A valid BST is defined as follows: the left subtree of a node contains only nodes with keys less than the node's key, the right subtree contains only nodes with keys greater than the node's key, and both the left and right subtrees must also be binary search trees.",
    examples: [
      { input: "root = [2,1,3]", output: "true" },
      { input: "root = [5,1,4,null,null,3,6]", output: "false", explanation: "The root node's value is 5 but its right child's value is 4." },
    ],
    constraints: [
      "The number of nodes in the tree is in the range [1, 10^4].",
      "-2^31 <= Node.val <= 2^31 - 1",
    ],
  },
  {
    title: "3Sum",
    difficulty: "Medium",
    description:
      "Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, j != k, and nums[i] + nums[j] + nums[k] == 0. The solution set must not contain duplicate triplets.",
    examples: [
      { input: "nums = [-1,0,1,2,-1,-4]", output: "[[-1,-1,2],[-1,0,1]]" },
      { input: "nums = [0,1,1]", output: "[]" },
      { input: "nums = [0,0,0]", output: "[[0,0,0]]" },
    ],
    constraints: [
      "3 <= nums.length <= 3000",
      "-10^5 <= nums[i] <= 10^5",
    ],
  },
  {
    title: "Word Search",
    difficulty: "Medium",
    description:
      "Given an m x n grid of characters board and a string word, return true if word exists in the grid. The word can be constructed from letters of sequentially adjacent cells, where adjacent cells are horizontally or vertically neighboring. The same letter cell may not be used more than once.",
    examples: [
      { input: 'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCCED"', output: "true" },
      { input: 'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "SEE"', output: "true" },
      { input: 'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCB"', output: "false" },
    ],
    constraints: [
      "m == board.length",
      "n = board[i].length",
      "1 <= m, n <= 6",
      "1 <= word.length <= 15",
    ],
  },
  {
    title: "Longest Common Subsequence",
    difficulty: "Medium",
    description:
      "Given two strings text1 and text2, return the length of their longest common subsequence. If there is no common subsequence, return 0. A subsequence of a string is a new string generated from the original string with some characters (can be none) deleted without changing the relative order of the remaining characters.",
    examples: [
      { input: 'text1 = "abcde", text2 = "ace"', output: "3", explanation: 'The longest common subsequence is "ace" with length 3.' },
      { input: 'text1 = "abc", text2 = "abc"', output: "3" },
      { input: 'text1 = "abc", text2 = "def"', output: "0" },
    ],
    constraints: [
      "1 <= text1.length, text2.length <= 1000",
      "text1 and text2 consist of only lowercase English characters.",
    ],
  },
  {
    title: "Trapping Rain Water",
    difficulty: "Hard",
    description:
      "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
    examples: [
      { input: "height = [0,1,0,2,1,0,1,3,2,1,2,1]", output: "6", explanation: "The above elevation map traps 6 units of rain water." },
      { input: "height = [4,2,0,3,2,5]", output: "9" },
    ],
    constraints: [
      "n == height.length",
      "1 <= n <= 2 * 10^4",
      "0 <= height[i] <= 10^5",
    ],
  },
  {
    title: "Median of Two Sorted Arrays",
    difficulty: "Hard",
    description:
      "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays. The overall run time complexity should be O(log (m+n)).",
    examples: [
      { input: "nums1 = [1,3], nums2 = [2]", output: "2.00000", explanation: "merged array = [1,2,3] and median is 2." },
      { input: "nums1 = [1,2], nums2 = [3,4]", output: "2.50000", explanation: "merged array = [1,2,3,4] and median is (2+3)/2 = 2.5." },
    ],
    constraints: [
      "nums1.length == m",
      "nums2.length == n",
      "0 <= m <= 1000",
      "0 <= n <= 1000",
      "1 <= m + n <= 2000",
      "-10^6 <= nums1[i], nums2[i] <= 10^6",
    ],
  },
];

function getRandomProblem(): Problem {
  return PROBLEMS[Math.floor(Math.random() * PROBLEMS.length)];
}

const roomCode = new Map<string, string>();
const roomProblem = new Map<string, Problem>();
const roomTimer = new Map<string, RoomTimer>();

export const registerCodeSocket = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log("Socket connected:", socket.id);

    let currentRoom: string | null = null;

    socket.on("join-room", ({ roomId }: JoinRoomPayload, callback?: (payload: { code: string | null; problem: Problem | null; timer: RoomTimer | null }) => void) => {
      if (currentRoom) socket.leave(currentRoom);
      socket.join(roomId);
      currentRoom = roomId;
      socket.to(roomId).emit("user-joined", { socketId: socket.id });
      callback?.({
        code: roomCode.get(roomId) ?? null,
        problem: roomProblem.get(roomId) ?? null,
        timer: roomTimer.get(roomId) ?? null,
      });
    });

    socket.on("leave-room", ({ roomId }: JoinRoomPayload) => {
      socket.leave(roomId);
      socket.to(roomId).emit("user-left", { socketId: socket.id });
      if (currentRoom === roomId) currentRoom = null;
    });

    socket.on("code-change", ({ roomId, code }: CodeChangePayload) => {
      if (roomId !== currentRoom) return;
      roomCode.set(roomId, code);
      socket.to(roomId).emit("code-change", { code });
    });

    socket.on("start-interview", ({ roomId, duration = 2700 }: StartInterviewPayload) => {
      if (roomId !== currentRoom) return;
      const problem = getRandomProblem();
      const timer: RoomTimer = { startedAt: Date.now(), duration };
      roomProblem.set(roomId, problem);
      roomTimer.set(roomId, timer);
      io.to(roomId).emit("interview-started", { problem, timer });
    });

    socket.on("end-interview", ({ roomId }: JoinRoomPayload) => {
      if (roomId !== currentRoom) return;
      roomProblem.delete(roomId);
      roomTimer.delete(roomId);
      io.to(roomId).emit("interview-ended");
    });

    socket.on("chat-message", ({ roomId, text }: ChatMessagePayload) => {
      if (roomId !== currentRoom) return;
      const trimmed = text.trim();
      if (!trimmed) return;
      socket.to(roomId).emit("chat-message", { socketId: socket.id, text: trimmed });
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
      if (currentRoom) {
        socket.to(currentRoom).emit("user-left", { socketId: socket.id });
      }
    });
  });
};
