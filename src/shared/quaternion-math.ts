/**
 * Shared Quaternion Mathematics
 * 
 * This module provides common quaternion operations that are used by both
 * the TypeScript and WebAssembly implementations to reduce code duplication.
 */

/**
 * Quaternion representation
 */
export interface Quaternion {
  w: number;
  x: number;
  y: number;
  z: number;
}

/**
 * 3D Vector representation
 */
export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

/**
 * Create a quaternion from components
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

/**
 * Get the conjugate of a quaternion
 */
export function conjugateQuaternion(q: Quaternion): Quaternion {
  return { w: q.w, x: -q.x, y: -q.y, z: -q.z };
}

/**
 * Stereographic projection from 4D to 3D
 * Uses hemisphere-aware projection to keep coordinates bounded
 */
export function stereographicProjection(quaternion: Quaternion): Vector3D {
  const { w, x, y, z } = quaternion;

  // Handle pole singularities
  if (Math.abs(1 - w) < 1e-10) {
    return { x: 0, y: 0, z: 0 };
  }
  if (Math.abs(-1 - w) < 1e-10) {
    return { x: 0, y: 0, z: 0 };
  }

  // Hemisphere-aware projection
  // Determine hemisphere based on w component
  const side = w >= 0 ? 1 : -1;
  
  let scale;
  if (side > 0) {
    // Upper hemisphere: project from north pole (1, 0, 0, 0)
    scale = 1 / (1 + w);
  } else {
    // Lower hemisphere: project from south pole (-1, 0, 0, 0)
    scale = 1 / (1 - w);
  }
  
  return {
    x: x * scale,
    y: y * scale,
    z: z * scale
  };
}

/**
 * Inverse stereographic projection from 3D to 4D
 */
export function inverseStereographicProjection(point: Vector3D): Quaternion {
  const { x, y, z } = point;
  const r2 = x * x + y * y + z * z;

  // Handle north pole singularity
  if (r2 < 1e-10) {
    return { w: 1, x: 0, y: 0, z: 0 };
  }

  const w = (r2 - 1) / (r2 + 1);
  const scale = 2 / (r2 + 1);

  return {
    w: w,
    x: x * scale,
    y: y * scale,
    z: z * scale
  };
}

/**
 * Hemisphere-aware inverse stereographic projection from 3D to 4D
 */
export function inverseStereographicProjectionWithSide(point: Vector3D, side: number): Quaternion {
  const { x, y, z } = point;
  const r2 = x * x + y * y + z * z;
  
  // Handle north pole singularity
  if (r2 < 1e-10) {
    return side > 0 ? { w: 1, x: 0, y: 0, z: 0 } : { w: -1, x: 0, y: 0, z: 0 };
  }
  
  // Hemisphere-aware w calculation
  const w = side > 0 ? (r2 - 1) / (r2 + 1) : (1 - r2) / (r2 + 1);
  const scale = 2 / (r2 + 1);
  
  return { w, x: x * scale, y: y * scale, z: z * scale };
}

/**
 * Add two 3D vectors
 */
export function addVector3D(point: Vector3D, vector: Vector3D): Vector3D {
  return {
    x: point.x + vector.x,
    y: point.y + vector.y,
    z: point.z + vector.z
  };
}

/**
 * Calculate the magnitude of a 3D vector
 */
export function magnitude3D(point: Vector3D): number {
  return Math.sqrt(point.x * point.x + point.y * point.y + point.z * point.z);
}

/**
 * Flip hemisphere side
 */
export function flipHemisphere(_point: Vector3D, quaternion: Quaternion): Vector3D {
  // Simple hemisphere flip - negate the quaternion w component
  const flippedQuaternion = { ...quaternion, w: -quaternion.w };
  return stereographicProjection(flippedQuaternion);
}

/**
 * Flip smallest component
 */
export function flipSmallestComponent(point: Vector3D): Vector3D {
  const absX = Math.abs(point.x);
  const absY = Math.abs(point.y);
  const absZ = Math.abs(point.z);

  if (absX <= absY && absX <= absZ) {
    return { ...point, x: -point.x };
  } else if (absY <= absZ) {
    return { ...point, y: -point.y };
  } else {
    return { ...point, z: -point.z };
  }
}

/**
 * Flip all components except largest
 */
export function flipAllExceptLargest(point: Vector3D): Vector3D {
  const absX = Math.abs(point.x);
  const absY = Math.abs(point.y);
  const absZ = Math.abs(point.z);

  if (absX >= absY && absX >= absZ) {
    return { ...point, y: -point.y, z: -point.z };
  } else if (absY >= absZ) {
    return { ...point, x: -point.x, z: -point.z };
  } else {
    return { ...point, x: -point.x, y: -point.y };
  }
}

/**
 * Side flip modes
 */
export enum SideFlipMode {
  PLAIN_FLIP = 0,
  FLIP_SMALLEST = 1,
  FLIP_ALL_EXCEPT_LARGEST = 2
}

/**
 * Apply side flipping based on mode
 */
export function applySideFlipping(
  point: Vector3D,
  mode: SideFlipMode,
  currentQuaternion: Quaternion
): Vector3D {
  const magnitude = magnitude3D(point);

  // If point is inside unit ball, no flipping needed
  if (magnitude <= 1.0) {
    return point;
  }

  // Apply side flipping based on mode
  switch (mode) {
    case SideFlipMode.PLAIN_FLIP:
      return flipHemisphere(point, currentQuaternion);
    case SideFlipMode.FLIP_SMALLEST:
      return flipSmallestComponent(point);
    case SideFlipMode.FLIP_ALL_EXCEPT_LARGEST:
      return flipAllExceptLargest(point);
    default:
      return point;
  }
}
