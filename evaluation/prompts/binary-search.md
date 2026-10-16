# Benchmark Prompt: Binary Search

## Educational Goal
Create an interactive learning experience that teaches how binary search operates on a sorted array of numbers.

The learner should develop an intuitive understanding of the divide-and-conquer strategy: how comparing the target with the middle element eliminates half of the remaining candidates at each step, and why this yields logarithmic time complexity.

## Learner Experience & Requirements
Assume the learner has never heard of binary search, does not yet know what “sorted” means, and has no teacher beside them. Begin with a familiar search problem and explain the needed idea in plain language before introducing algorithm terminology, code, or complexity notation. Guide the learner through a short narrative with one primary visual and one clear next action at a time. Explain why each visible change happens. Ask for a focused prediction before revealing meaningful outcomes, and give supportive feedback for both right and wrong answers. Introduce O(log n) only after the learner has experienced repeated halving. Keep code, raw state, event logs, and advanced controls optional or secondary.

1. **Target Selection**: The learner should be able to choose or input a target number to search for (including both values present in the array and missing values).
2. **Step-by-Step Execution**: The learner should be able to step forward through the search process at their own pace, run the search automatically, pause, and reset the search space.
3. **Visual Representation**:
   * Clearly visualize the sorted collection of elements.
   * Highlight the active search window with lower and upper search boundary pointers.
   * Clearly highlight the current midpoint candidate being compared.
   * Visually differentiate eliminated elements from elements still under consideration.
   * Indicate when the target is successfully found or when the search concludes that the target is absent.
4. **History & Progression**:
   * Maintain a log or history of comparisons showing the decisions made at each step.
   * Show how the size of the active search space decreases as comparisons proceed.
5. **Prediction & Active Inquiry**:
   * Prompt the learner to predict the next step or outcome before advancing the search.
6. **Pedagogical Explanation**:
   * Clearly explain why the array must be sorted.
   * Explain the mathematical reason why halving the search space repeatedly leads to $O(\log n)$ comparisons in the worst case.
7. **Knowledge Check**:
   * Include a short assessment with immediate feedback to check the learner's understanding of binary search behavior and efficiency.

The listed capabilities do not need equal prominence at once. Design their order around the learner's understanding, and keep the simulation and its explanation consistent.

