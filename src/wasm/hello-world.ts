/**
 * Simple Hello World WebAssembly Module
 * 
 * Minimal AssemblyScript module for testing
 */

/**
 * Add two integers
 */
export function add(a: i32, b: i32): i32 {
  return a + b;
}

/**
 * Multiply two integers
 */
export function multiply(a: i32, b: i32): i32 {
  return a * b;
}

/**
 * Calculate factorial
 */
export function factorial(n: i32): i32 {
  if (n <= 1) {
    return 1;
  }
  return n * factorial(n - 1);
}

/**
 * Simple deterministic "random" number
 */
export function simpleRandom(seed: i32): f32 {
  const x = f32(seed) * 0.001;
  return x;
}

/**
 * Calculate square of a number
 */
export function square(x: f32): f32 {
  return x * x;
}
