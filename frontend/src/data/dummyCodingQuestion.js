export const dummyCodingQuestion = {
  id: 1,
  title: "Two Sum",
  difficulty: "Easy",
  description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
  inputFormat: "The first line contains an integer n, the size of the array.\nThe second line contains n space-separated integers, representing the elements of the array.\nThe third line contains an integer target.",
  outputFormat: "Print the indices of the two numbers (0-indexed) space-separated.",
  constraints: [
    "2 <= nums.length <= 10^4",
    "-10^9 <= nums[i] <= 10^9",
    "-10^9 <= target <= 10^9",
    "Only one valid answer exists."
  ],
  sampleInput: "4\n2 7 11 15\n9",
  sampleOutput: "0 1",
  explanation: "Because nums[0] + nums[1] == 9, we return 0 1."
};
