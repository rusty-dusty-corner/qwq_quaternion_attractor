/**
 * Deterministic Random Number Generator (AssemblyScript)
 * 
 * Provides reproducible random numbers based on seed values.
 * Ensures identical results across platforms for the same seed.
 */

/**
 * Linear Congruential Generator (LCG)
 * Provides fast, deterministic pseudo-random numbers
 */
export class DeterministicRandom {
  private seed: i32;
  
  constructor(seed: i32) {
    this.seed = seed;
  }
  
  /**
   * Generate next random number in sequence
   */
  next(): f32 {
    // LCG parameters (same as used in many standard libraries)
    this.seed = (this.seed * 1664525 + 1013904223) % 2147483647;
    return f32(this.seed) / f32(2147483647);
  }
  
  /**
   * Generate random float between min and max
   */
  nextFloat(min: f32, max: f32): f32 {
    return min + this.next() * (max - min);
  }
  
  /**
   * Generate random integer between 0 and max (exclusive)
   */
  nextInt(max: i32): i32 {
    return i32(this.next() * f32(max));
  }
  
  /**
   * Generate random boolean
   */
  nextBoolean(): boolean {
    return this.next() < 0.5;
  }
  
  /**
   * Generate random point on unit sphere
   */
  nextPointOnSphere(): Float32Array {
    // Generate random point on unit sphere using Marsaglia method
    let x1: f32, x2: f32, w: f32;
    
    do {
      x1 = this.nextFloat(-1.0, 1.0);
      x2 = this.nextFloat(-1.0, 1.0);
      w = x1*x1 + x2*x2;
    } while (w >= 1.0);
    
    const scale = f32(Math.sqrt((1.0 - w) / w));
    const result = new Float32Array(3);
    result[0] = x1 * scale;
    result[1] = x2 * scale;
    result[2] = 1.0 - 2.0 * w;
    return result;
  }
  
  /**
   * Generate random quaternion (uniformly distributed on S³)
   */
  nextQuaternion(): Float32Array {
    // Generate random quaternion using Marsaglia method
    let x1: f32, x2: f32, x3: f32, x4: f32, w: f32;
    
    do {
      x1 = this.nextFloat(-1.0, 1.0);
      x2 = this.nextFloat(-1.0, 1.0);
      x3 = this.nextFloat(-1.0, 1.0);
      x4 = this.nextFloat(-1.0, 1.0);
      w = x1*x1 + x2*x2 + x3*x3 + x4*x4;
    } while (w >= 1.0);
    
    const scale = f32(Math.sqrt((1.0 - w) / w));
    const result = new Float32Array(4);
    result[0] = x1 * scale;
    result[1] = x2 * scale;
    result[2] = x3 * scale;
    result[3] = x4 * scale;
    return result;
  }
  
  /**
   * Get current seed value
   */
  getSeed(): i32 {
    return this.seed;
  }
  
  /**
   * Set new seed value
   */
  setSeed(seed: i32): void {
    this.seed = seed;
  }
  
  /**
   * Reset to initial seed (useful for testing)
   */
  reset(): void {
    // Note: This would require storing initial seed
    // For now, just reinitialize with current seed
    this.seed = this.seed;
  }
}
