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
  
  const length = f32(Math.sqrt(w*w + x*x + y*y + z*z));
  
  if (length === 0.0) {
    const result = new Float32Array(4);
    result[0] = 1.0;
    result[1] = 0.0;
    result[2] = 0.0;
    result[3] = 0.0;
    return result;
  }
  
  const result = new Float32Array(4);
  result[0] = w/length;
  result[1] = x/length;
  result[2] = y/length;
  result[3] = z/length;
  return result;
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
  
  const result = new Float32Array(4);
  result[0] = w1*w2 - x1*x2 - y1*y2 - z1*z2;
  result[1] = w1*x2 + x1*w2 + y1*z2 - z1*y2;
  result[2] = w1*y2 - x1*z2 + y1*w2 + z1*x2;
  result[3] = w1*z2 + x1*y2 - y1*x2 + z1*w2;
  return result;
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
    const result = new Float32Array(3);
    result[0] = 0.0;
    result[1] = 0.0;
    result[2] = 0.0;
    return result;
  }
  
  const scale = 1.0 / (1.0 - w);
  const result = new Float32Array(3);
  result[0] = f32(x * scale);
  result[1] = f32(y * scale);
  result[2] = f32(z * scale);
  return result;
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
    const result = new Float32Array(4);
    result[0] = 1.0;
    result[1] = 0.0;
    result[2] = 0.0;
    result[3] = 0.0;
    return result;
  }
  
  const w = (r2 - 1.0) / (r2 + 1.0);
  const scale = 2.0 / (r2 + 1.0);
  
  const result = new Float32Array(4);
  result[0] = w;
  result[1] = f32(x * scale);
  result[2] = f32(y * scale);
  result[3] = f32(z * scale);
  return result;
}

/**
 * Rotate a 3D vector using a quaternion
 */
export function rotateVector(v: Float32Array, q: Float32Array): Float32Array {
  // Convert vector to pure quaternion
  const vQuat = new Float32Array(4);
  vQuat[0] = 0.0;
  vQuat[1] = v[0];
  vQuat[2] = v[1];
  vQuat[3] = v[2];
  
  // Apply rotation: v' = q * v * q*
  const qv = quaternionMultiply(q, vQuat);
  const qConj = new Float32Array(4);
  qConj[0] = q[0];
  qConj[1] = -q[1];
  qConj[2] = -q[2];
  qConj[3] = -q[3];
  const result = quaternionMultiply(qv, qConj);
  
  const finalResult = new Float32Array(3);
  finalResult[0] = result[1];
  finalResult[1] = result[2];
  finalResult[2] = result[3];
  return finalResult;
}

/**
 * Calculate distance between two 3D points
 */
export function distance3D(p1: Float32Array, p2: Float32Array): f32 {
  const dx = p1[0] - p2[0];
  const dy = p1[1] - p2[1];
  const dz = p1[2] - p2[2];
  
  return f32(Math.sqrt(dx*dx + dy*dy + dz*dz));
}

/**
 * Calculate magnitude of a 3D vector
 */
export function magnitude3D(v: Float32Array): f32 {
  return f32(Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]));
}
