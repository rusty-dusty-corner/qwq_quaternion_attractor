/**
 * Simple Math Functions for AssemblyScript
 * 
 * Basic mathematical functions that compile to WebAssembly
 */

/**
 * Add two numbers
 */
export function add(a: f32, b: f32): f32 {
  return a + b;
}

/**
 * Multiply two numbers
 */
export function multiply(a: f32, b: f32): f32 {
  return a * b;
}

/**
 * Calculate square root
 */
export function sqrt(x: f32): f32 {
  return f32(Math.sqrt(x));
}

/**
 * Calculate sine
 */
export function sin(x: f32): f32 {
  return f32(Math.sin(x));
}

/**
 * Calculate cosine
 */
export function cos(x: f32): f32 {
  return f32(Math.cos(x));
}

/**
 * Generate a simple deterministic "random" number
 */
export function deterministicRandom(seed: i32): f32 {
  const x = f32(seed) * 0.0001;
  return f32((Math.sin(x) + 1.0) * 0.5);
}

/**
 * Simple quaternion normalization (simplified)
 */
export function normalizeQuaternionSimple(w: f32, x: f32, y: f32, z: f32): f32 {
  const length = sqrt(w*w + x*x + y*y + z*z);
  if (length === 0.0) {
    return 1.0; // Return w component of [1,0,0,0]
  }
  return w / length;
}

/**
 * Simple stereographic projection (2D version)
 */
export function stereographicProjectionSimple(x: f32, y: f32): f32 {
  const r = sqrt(x*x + y*y);
  if (r === 0.0) {
    return 0.0;
  }
  return x / (1.0 + r);
}

/**
 * Simple attractor iteration
 */
export function attractorIteration(x: f32, y: f32, a: f32, b: f32): f32 {
  const x2 = x * x;
  const y2 = y * y;
  const x_new = a - x2 + b * y;
  return x_new;
}
