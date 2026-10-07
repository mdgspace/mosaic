# Benchmark Prompt: Gradient Descent

## Educational Goal
Create an interactive learning experience that teaches how Gradient Descent optimizes an objective function to find a local or global minimum.

The learner should develop an intuitive understanding of gradient estimation, the role of step size (learning rate $\eta$), and the trade-offs between slow convergence, steady convergence, oscillation, and divergence.

## Learner Experience & Requirements
1. **Parameter Tuning**:
   * The learner should be able to adjust the learning rate (step size $\eta$), initial starting position ($x_0$), and optional momentum or iteration limits.
   * Provide presets representing typical scenarios: standard convergence, slow learning rate, oscillating near minimum, and exploding/diverging learning rate.
2. **Interactive Optimization**:
   * The learner should be able to trigger optimization steps one-by-one, play continuous descent iterations, pause, and reset back to initial parameters.
3. **Visual Representation**:
   * Visualize the loss curve / objective landscape (e.g. $f(x) = x^2$ or a multi-well potential).
   * Display the current optimization point moving along the objective curve toward the minimum.
   * Graph the loss/objective value over iteration steps to show rate of convergence or instability.
   * Highlight gradient magnitude and update vector direction at the current point.
4. **Milestones & Event Logging**:
   * Log each step showing current coordinate $x$, loss value $f(x)$, and computed gradient $f'(x)$.
   * Detect and notify the learner upon convergence (gradient near zero) or divergence (loss exceeding threshold).
5. **Prediction & Active Inquiry**:
   * Prompt the learner to predict what will happen if the learning rate is set too high versus too low before running the descent.
6. **Pedagogical Explanation**:
   * Explain the gradient descent update rule ($x_{t+1} = x_t - \eta \nabla f(x_t)$).
   * Explain why moving in the opposite direction of the derivative decreases the objective function.
7. **Knowledge Check**:
   * Include a short assessment with immediate feedback evaluating understanding of learning rates and convergence dynamics.

