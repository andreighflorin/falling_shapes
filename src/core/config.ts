/**
 * Centralised, tunable configuration. Keeping magic numbers in one place
 * makes the behaviour of the simulation easy to reason about and adjust.
 */
export const CONFIG = {
  /** Default auto-generation rate (shapes per second). */
  defaultShapesPerSecond: 1,
  minShapesPerSecond: 0,
  maxShapesPerSecond: 50,
  shapesPerSecondStep: 1,

  /**
   * Gravity value. Interpreted as downward acceleration in px/s² scaled by
   * GRAVITY_SCALE so that small integer values feel natural to the user.
   */
  defaultGravity: 1,
  minGravity: 0,
  maxGravity: 50,
  gravityStep: 1,
  /** Converts the user-facing gravity integer into px/s² of acceleration. */
  gravityScale: 120,

  /** Initial downward velocity applied to a newly spawned shape (px/s). */
  initialFallSpeed: 40,

  /** Shape sizing bounds (radius in px). */
  minShapeRadius: 16,
  maxShapeRadius: 42,

  /** Object pool guardrail so memory cannot grow unbounded on weak devices. */
  maxLiveShapes: 600,
} as const;
