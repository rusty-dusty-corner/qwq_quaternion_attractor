/**
 * Quaternion Attractor Engine (AssemblyScript)
 * 
 * Core deterministic mathematical engine for generating attractor patterns.
 * Compiles to WebAssembly for maximum performance.
 */

import { 
  normalizeQuaternion, 
  quaternionMultiply, 
  stereographicProjection, 
  inverseStereographicProjection,
  rotateVector,
  magnitude3D
} from './quaternion-math';
import { DeterministicRandom } from './deterministic-random';

/**
 * Side flip variation types
 */
export enum SideFlipVariation {
  PLAIN_FLIP = 0,
  FLIP_SMALLEST = 1,
  FLIP_ALL_EXCEPT_LARGEST = 2
}

/**
 * Attractor configuration
 */
export interface AttractorConfig {
  seed: i32;
  stepVector: Float32Array;    // [a, b, c]
  initialPosition: Float32Array; // [x, y, z]
  sideFlipVariation: i32;      // 0, 1, or 2
  globalRotation: Float32Array; // [w, x, y, z] quaternion
}

/**
 * Point data structure
 */
export interface AttractorPoint {
  x: f32;
  y: f32;
  z: f32;
  side: i32;  // +1 for north hemisphere, -1 for south
}

/**
 * Main attractor engine class
 */
export class AttractorEngine {
  private points: Float32Array;
  private currentIndex: i32 = 0;
  private random: DeterministicRandom;
  private config: AttractorConfig;
  
  // Current state
  private currentX: f32 = 0.0;
  private currentY: f32 = 0.0;
  private currentZ: f32 = 0.0;
  private currentSide: i32 = 1;
  
  // Statistics
  private sideFlipCount: i32 = 0;
  private totalSteps: i32 = 0;
  
  constructor(maxPoints: i32, config: AttractorConfig) {
    this.points = new Float32Array(maxPoints * 4); // x, y, z, side
    this.random = new DeterministicRandom(config.seed);
    this.config = config;
    
    // Initialize position
    this.currentX = config.initialPosition[0];
    this.currentY = config.initialPosition[1];
    this.currentZ = config.initialPosition[2];
    this.currentSide = 1;
  }
  
  /**
   * Generate attractor points
   */
  generatePoints(count: i32): void {
    this.currentIndex = 0;
    this.sideFlipCount = 0;
    this.totalSteps = 0;
    
    // Reset position
    this.currentX = this.config.initialPosition[0];
    this.currentY = this.config.initialPosition[1];
    this.currentZ = this.config.initialPosition[2];
    this.currentSide = 1;
    
    // Reset random generator to ensure reproducibility
    this.random.setSeed(this.config.seed);
    
    for (let i = 0; i < count; i++) {
      this.generateNextPoint();
      this.totalSteps++;
    }
  }
  
  /**
   * Generate single next point in the sequence
   */
  private generateNextPoint(): void {
    // Apply step vector
    const newX = this.currentX + this.config.stepVector[0] * f32(this.currentSide);
    const newY = this.currentY + this.config.stepVector[1] * f32(this.currentSide);
    const newZ = this.currentZ + this.config.stepVector[2] * f32(this.currentSide);
    
    // Check boundary condition
    const distance = Math.sqrt(newX*newX + newY*newY + newZ*newZ);
    
    if (distance > 1.0) {
      // Apply side flip variation
      this.applySideFlipVariation(newX, newY, newZ);
      this.currentSide = -this.currentSide;
      this.sideFlipCount++;
    } else {
      // Update position normally
      this.currentX = newX;
      this.currentY = newY;
      this.currentZ = newZ;
    }
    
    // Apply global rotation if enabled
    if (this.config.globalRotation[0] !== 1.0 || 
        this.config.globalRotation[1] !== 0.0 || 
        this.config.globalRotation[2] !== 0.0 || 
        this.config.globalRotation[3] !== 0.0) {
      this.applyGlobalRotation();
    }
    
    // Store point
    this.storeCurrentPoint();
  }
  
  /**
   * Apply side flip variation based on configuration
   */
  private applySideFlipVariation(newX: f32, newY: f32, newZ: f32): void {
    switch (this.config.sideFlipVariation) {
      case SideFlipVariation.FLIP_SMALLEST:
        this.applyFlipSmallestVariation(newX, newY, newZ);
        break;
      case SideFlipVariation.FLIP_ALL_EXCEPT_LARGEST:
        this.applyFlipAllExceptLargestVariation(newX, newY, newZ);
        break;
      case SideFlipVariation.PLAIN_FLIP:
      default:
        // No coordinate modification, just side flip
        break;
    }
  }
  
  /**
   * Variation 1: Flip only the smallest component
   */
  private applyFlipSmallestVariation(newX: f32, newY: f32, newZ: f32): void {
    const absX = Math.abs(newX);
    const absY = Math.abs(newY);
    const absZ = Math.abs(newZ);
    
    if (absX <= absY && absX <= absZ) {
      this.currentX = -newX;
      this.currentY = newY;
      this.currentZ = newZ;
    } else if (absY <= absX && absY <= absZ) {
      this.currentX = newX;
      this.currentY = -newY;
      this.currentZ = newZ;
    } else {
      this.currentX = newX;
      this.currentY = newY;
      this.currentZ = -newZ;
    }
  }
  
  /**
   * Variation 2: Flip all components except the largest
   */
  private applyFlipAllExceptLargestVariation(newX: f32, newY: f32, newZ: f32): void {
    const absX = Math.abs(newX);
    const absY = Math.abs(newY);
    const absZ = Math.abs(newZ);
    
    if (absX >= absY && absX >= absZ) {
      // X is largest, flip Y and Z
      this.currentX = newX;
      this.currentY = -newY;
      this.currentZ = -newZ;
    } else if (absY >= absX && absY >= absZ) {
      // Y is largest, flip X and Z
      this.currentX = -newX;
      this.currentY = newY;
      this.currentZ = -newZ;
    } else {
      // Z is largest, flip X and Y
      this.currentX = -newX;
      this.currentY = -newY;
      this.currentZ = newZ;
    }
  }
  
  /**
   * Apply global quaternion rotation
   */
  private applyGlobalRotation(): void {
    // Convert current position to quaternion
    const currentPos = new Float32Array([this.currentX, this.currentY, this.currentZ]);
    const quaternion = inverseStereographicProjection(currentPos);
    
    // Apply rotation: q' = r * q
    const rotatedQuat = quaternionMultiply(this.config.globalRotation, quaternion);
    const normalizedQuat = normalizeQuaternion(rotatedQuat);
    
    // Convert back to 3D coordinates
    const rho2 = normalizedQuat[1]*normalizedQuat[1] + 
                 normalizedQuat[2]*normalizedQuat[2] + 
                 normalizedQuat[3]*normalizedQuat[3];
    const denom = rho2 + 1.0;
    
    this.currentX = normalizedQuat[1] * 2.0 / denom;
    this.currentY = normalizedQuat[2] * 2.0 / denom;
    this.currentZ = normalizedQuat[3] * 2.0 / denom;
    this.currentSide = (normalizedQuat[0] >= 0.0) ? 1 : -1;
  }
  
  /**
   * Store current point in the points array
   */
  private storeCurrentPoint(): void {
    if (this.currentIndex * 4 < this.points.length) {
      const index = this.currentIndex * 4;
      this.points[index] = this.currentX;
      this.points[index + 1] = this.currentY;
      this.points[index + 2] = this.currentZ;
      this.points[index + 3] = f32(this.currentSide);
      this.currentIndex++;
    }
  }
  
  /**
   * Get all generated points
   */
  getPoints(): Float32Array {
    return this.points;
  }
  
  /**
   * Get number of generated points
   */
  getPointCount(): i32 {
    return this.currentIndex;
  }
  
  /**
   * Get point range for memory efficiency
   */
  getPointRange(start: i32, count: i32): Float32Array {
    const result = new Float32Array(count * 4);
    const maxCount = Math.min(count, this.currentIndex - start);
    
    for (let i = 0; i < maxCount; i++) {
      const srcIndex = (start + i) * 4;
      const dstIndex = i * 4;
      result[dstIndex] = this.points[srcIndex];
      result[dstIndex + 1] = this.points[srcIndex + 1];
      result[dstIndex + 2] = this.points[srcIndex + 2];
      result[dstIndex + 3] = this.points[srcIndex + 3];
    }
    
    return result;
  }
  
  /**
   * Get current state
   */
  getCurrentState(): AttractorPoint {
    return {
      x: this.currentX,
      y: this.currentY,
      z: this.currentZ,
      side: this.currentSide
    };
  }
  
  /**
   * Get statistics
   */
  getStatistics(): Float32Array {
    return new Float32Array([
      f32(this.totalSteps),
      f32(this.sideFlipCount),
      f32(this.currentIndex),
      this.currentX,
      this.currentY,
      this.currentZ,
      f32(this.currentSide)
    ]);
  }
  
  /**
   * Update configuration
   */
  updateConfig(newConfig: AttractorConfig): void {
    this.config = newConfig;
    this.random.setSeed(newConfig.seed);
  }
  
  /**
   * Reset engine state
   */
  reset(): void {
    this.currentIndex = 0;
    this.sideFlipCount = 0;
    this.totalSteps = 0;
    
    this.currentX = this.config.initialPosition[0];
    this.currentY = this.config.initialPosition[1];
    this.currentZ = this.config.initialPosition[2];
    this.currentSide = 1;
    
    this.random.setSeed(this.config.seed);
  }
}
