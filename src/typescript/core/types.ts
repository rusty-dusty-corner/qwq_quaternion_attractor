/**
 * Core Type Definitions for Quaternion Attractor Draft01 Implementation
 * 
 * This file defines the unified API interface that separates:
 * - Constant Parameters (mathematical core that doesn't change)
 * - Render Parameters (visualization settings that can change)
 * - Output Results (generated points and final state)
 */

// ============================================================================
// BASIC TYPES
// ============================================================================

/**
 * 3D Vector representation
 */
export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

/**
 * Quaternion representation (w, x, y, z)
 */
export interface Quaternion {
  w: number;
  x: number;
  y: number;
  z: number;
}

/**
 * 2D Point for rendering output
 */
export interface Point2D {
  x: number;
  y: number;
  color?: string;  // Optional color for visualization
  alpha?: number;  // Optional transparency
}

// ============================================================================
// CONSTANT PARAMETERS (Mathematical Core)
// ============================================================================

/**
 * Side flip variation modes
 */
export enum SideFlipMode {
  /** Variation 0: Plain flip - only hemisphere switching */
  PLAIN_FLIP = 0,
  /** Variation 1: Flip smallest component - delicate filigree patterns */
  FLIP_SMALLEST = 1,
  /** Variation 2: Flip all except largest - dramatic elongated flows */
  FLIP_ALL_EXCEPT_LARGEST = 2
}

/**
 * Constant parameters that define the mathematical core of the attractor.
 * These parameters remain unchanged during a session and define the
 * fundamental behavior of the attractor system.
 */
export interface AttractorConstants {
  /** START - Initial quaternion point where the attractor begins */
  start: Quaternion;
  
  /** ADDITIVE - 3D vector for phyllotaxis tuning and pattern generation */
  additive: Vector3D;
  
  /** WIND - Constant rotation quaternion that affects the core algorithm dynamics */
  wind: Quaternion;
  
  /** MODE - Side flip variation selector (0, 1, or 2) */
  mode: SideFlipMode;
}

// ============================================================================
// RENDER PARAMETERS (Visualization)
// ============================================================================

/**
 * Projection types for different visualization effects
 */
export enum ProjectionType {
  /** Simple 2D projection - direct coordinate mapping */
  SIMPLE = 'simple',
  /** Sphere projection - 3D rotation + projection for depth effects */
  SPHERE = 'sphere'
}

/**
 * Render parameters that control visualization and output generation.
 * These parameters can be changed without affecting the mathematical
 * core behavior, allowing for different visual representations of the
 * same attractor pattern.
 */
export interface RenderParameters {
  /** Projection type - how to map 3D points to 2D */
  projectionType: ProjectionType;
  
  /** Camera rotation quaternion - used during rendering for view transformation */
  cameraRotation: Quaternion;
  
  /** Batch size - number of 2D points to generate per call */
  batchSize: number;
}

// ============================================================================
// OUTPUT RESULTS
// ============================================================================

/**
 * Result of a single attractor generation batch
 */
export interface AttractorResult {
  /** Generated 2D points for rendering */
  points: Point2D[];
  
  /** Final quaternion state after generation (for chaining operations) */
  finalQuaternion: Quaternion;
  
  /** Generation metadata */
  metadata?: {
    /** Number of iterations performed */
    iterations: number;
    /** Total computation time (milliseconds) */
    computationTime?: number;
    /** Memory usage (bytes) */
    memoryUsage?: number;
  };
}

// ============================================================================
// MAIN API INTERFACE
// ============================================================================

/**
 * Core attractor engine interface
 */
export interface AttractorEngine {
  /**
   * Generate a batch of 2D points from the attractor
   * 
   * @param constants - Mathematical core parameters (unchanged during session)
   * @param renderParams - Visualization parameters (can change per call)
   * @returns Generated points and final state for chaining
   */
  generateBatch(
    constants: AttractorConstants,
    renderParams: RenderParameters
  ): AttractorResult;
  
  /**
   * Generate multiple batches for animation or large point sets
   * 
   * @param constants - Mathematical core parameters
   * @param renderParams - Visualization parameters
   * @param batchCount - Number of batches to generate
   * @returns Array of results for each batch
   */
  generateMultipleBatches(
    constants: AttractorConstants,
    renderParams: RenderParameters,
    batchCount: number
  ): AttractorResult[];
  
  /**
   * Validate parameters before processing
   * 
   * @param constants - Constants to validate
   * @param renderParams - Render params to validate
   * @returns Validation result with any errors
   */
  validateParameters(
    constants: AttractorConstants,
    renderParams: RenderParameters
  ): ValidationResult;
}

// ============================================================================
// VALIDATION AND UTILITIES
// ============================================================================

/**
 * Validation result for parameter checking
 */
export interface ValidationResult {
  /** Whether parameters are valid */
  isValid: boolean;
  
  /** List of validation errors */
  errors: string[];
  
  /** List of validation warnings */
  warnings: string[];
}

/**
 * Default parameter values for quick setup
 */
export const DEFAULT_CONSTANTS: AttractorConstants = {
  start: { w: 0.5, x: 0.5, y: 0.5, z: 0.5 },
  additive: { x: 0.1, y: 0.1, z: 0.1 },
  wind: { w: 1.0, x: 0.0, y: 0.0, z: 0.0 },
  mode: SideFlipMode.PLAIN_FLIP
};

export const DEFAULT_RENDER_PARAMS: RenderParameters = {
  projectionType: ProjectionType.SIMPLE,
  cameraRotation: { w: 1.0, x: 0.0, y: 0.0, z: 0.0 },
  batchSize: 100
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create a unit quaternion from components
 */
export function createQuaternion(w: number, x: number, y: number, z: number): Quaternion {
  return { w, x, y, z };
}

/**
 * Create a 3D vector
 */
export function createVector3D(x: number, y: number, z: number): Vector3D {
  return { x, y, z };
}

/**
 * Create a 2D point
 */
export function createPoint2D(x: number, y: number, color?: string, alpha?: number): Point2D {
  return { x, y, color, alpha };
}

/**
 * Normalize a quaternion to unit length
 */
export function normalizeQuaternion(q: Quaternion): Quaternion {
  const length = Math.sqrt(q.w * q.w + q.x * q.x + q.y * q.y + q.z * q.z);
  if (length === 0) {
    return { w: 1, x: 0, y: 0, z: 0 }; // Default to identity
  }
  return {
    w: q.w / length,
    x: q.x / length,
    y: q.y / length,
    z: q.z / length
  };
}

/**
 * Multiply two quaternions
 */
export function multiplyQuaternions(q1: Quaternion, q2: Quaternion): Quaternion {
  return {
    w: q1.w * q2.w - q1.x * q2.x - q1.y * q2.y - q1.z * q2.z,
    x: q1.w * q2.x + q1.x * q2.w + q1.y * q2.z - q1.z * q2.y,
    y: q1.w * q2.y - q1.x * q2.z + q1.y * q2.w + q1.z * q2.x,
    z: q1.w * q2.z + q1.x * q2.y - q1.y * q2.x + q1.z * q2.w
  };
}
