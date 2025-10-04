/**
 * Quaternion Math Operations (AssemblyScript)
 * 
 * Pure mathematical functions for quaternion operations.
 * Compiled to WebAssembly for maximum performance.
 */

// Type definitions for AssemblyScript (inline types)
// Quaternion = Float32Array; // [w, x, y, z]
// Point3D = Float32Array;    // [x, y, z]
// Vector3D = Float32Array;   // [x, y, z]

/**
 * Normalize a quaternion to unit length
 */
export function normalizeQuaternion(q: Float32Array): Float32Array {
  const w = q[0];
  const x = q[1];
  const y = q[2];
  const z = q[3];
  
  const length = Math.sqrt(w*w + x*x + y*y + z*z);
  
  if (length === 0.0) {
    return new Float32Array([1.0, 0.0, 0.0, 0.0]);
  }
  
  return new Float32Array([w/length, x/length, y/length, z/length]);
}

/**
 * Multiply two quaternions using Hamilton product
 */
export function quaternionMultiply(q1: Float32Array, q2: Float32Array): Float32Array {
  const w1 = q1[0];
  const x1 = q1[1];
  const y1 = q1[2];
  const z1 = q1[3];
  
  const w2 = q2[0];
  const x2 = q2[1];
  const y2 = q2[2];
  const z2 = q2[3];
  
  return new Float32Array([
    w1*w2 - x1*x2 - y1*y2 - z1*z2,
    w1*x2 + x1*w2 + y1*z2 - z1*y2,
    w1*y2 - x1*z2 + y1*w2 + z1*x2,
    w1*z2 + x1*y2 - y1*x2 + z1*w2
  ]);
}

/**
 * Stereographic projection from 4D sphere to 3D space
 * Projects quaternion (w,x,y,z) to 3D coordinates
 */
export function stereographicProjection(q: Float32Array): Float32Array {
  const w = q[0];
  const x = q[1];
  const y = q[2];
  const z = q[3];
  
  // Handle north pole singularity
  if (Math.abs(1.0 - w) < 1e-10) {
    return new Float32Array([0.0, 0.0, 0.0]);
  }
  
  const scale = 1.0 / (1.0 - w);
  return new Float32Array([x * scale, y * scale, z * scale]);
}

/**
 * Inverse stereographic projection from 3D space to 4D sphere
 * Maps 3D point back to quaternion on S³
 */
export function inverseStereographicProjection(p: Float32Array): Float32Array {
  const x = p[0];
  const y = p[1];
  const z = p[2];
  
  const r2 = x*x + y*y + z*z;
  
  // Handle north pole singularity
  if (r2 < 1e-10) {
    return new Float32Array([1.0, 0.0, 0.0, 0.0]);
  }
  
  const w = (r2 - 1.0) / (r2 + 1.0);
  const scale = 2.0 / (r2 + 1.0);
  
  return new Float32Array([w, x * scale, y * scale, z * scale]);
}

/**
 * Rotate a 3D vector using a quaternion
 */
export function rotateVector(v: Float32Array, q: Float32Array): Float32Array {
  // Convert vector to pure quaternion
  const vQuat = new Float32Array([0.0, v[0], v[1], v[2]]);
  
  // Apply rotation: v' = q * v * q*
  const qv = quaternionMultiply(q, vQuat);
  const qConj = new Float32Array([q[0], -q[1], -q[2], -q[3]]);
  const result = quaternionMultiply(qv, qConj);
  
  return new Float32Array([result[1], result[2], result[3]]);
}

/**
 * Calculate distance between two 3D points
 */
export function distance3D(p1: Float32Array, p2: Float32Array): f32 {
  const dx = p1[0] - p2[0];
  const dy = p1[1] - p2[1];
  const dz = p1[2] - p2[2];
  
  return Math.sqrt(dx*dx + dy*dy + dz*dz);
}

/**
 * Calculate magnitude of a 3D vector
 */
export function magnitude3D(v: Float32Array): f32 {
  return Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
}
