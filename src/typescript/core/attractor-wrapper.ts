/**
 * Attractor Engine Wrapper
 * 
 * TypeScript wrapper around the WebAssembly attractor engine
 * Provides high-level interface while maintaining performance
 */

import { 
  WasmModule, 
  AttractorConfig, 
  AttractorPoint, 
  AttractorStatistics,
  SideFlipVariation,
  Point3D,
  Quaternion
} from './types';

export class AttractorWrapper {
  private wasm: WasmModule;
  private engine: number;  // Pointer to WASM AttractorEngine instance
  private config: AttractorConfig;
  private maxPoints: number;
  
  constructor(wasm: WasmModule, config: AttractorConfig, maxPoints: number = 100000) {
    this.wasm = wasm;
    this.config = config;
    this.maxPoints = maxPoints;
    
    // Create WASM AttractorEngine instance
    const configPtr = this.createConfigPointer();
    this.engine = new this.wasm.AttractorEngine(maxPoints, configPtr);
    
    // Clean up config pointer
    this.wasm.__unpin(configPtr);
  }
  
  /**
   * Generate attractor points
   */
  generatePoints(count: number): void {
    if (count > this.maxPoints) {
      throw new Error(`Point count ${count} exceeds maximum ${this.maxPoints}`);
    }
    
    this.wasm.AttractorEngine.prototype.generatePoints.call(this.engine, count);
  }
  
  /**
   * Get all generated points as JavaScript objects
   */
  getPoints(): AttractorPoint[] {
    const pointsPtr = this.wasm.AttractorEngine.prototype.getPoints.call(this.engine);
    const pointCount = this.wasm.AttractorEngine.prototype.getPointCount.call(this.engine);
    
    return this.extractPointsFromMemory(pointsPtr, pointCount);
  }
  
  /**
   * Get point range for memory efficiency
   */
  getPointRange(start: number, count: number): AttractorPoint[] {
    const rangePtr = this.wasm.AttractorEngine.prototype.getPointRange.call(
      this.engine, start, count
    );
    
    return this.extractPointsFromMemory(rangePtr, count);
  }
  
  /**
   * Get number of generated points
   */
  getPointCount(): number {
    return this.wasm.AttractorEngine.prototype.getPointCount.call(this.engine);
  }
  
  /**
   * Get current state
   */
  getCurrentState(): AttractorPoint {
    const statePtr = this.wasm.AttractorEngine.prototype.getCurrentState.call(this.engine);
    return this.extractPointFromMemory(statePtr);
  }
  
  /**
   * Get engine statistics
   */
  getStatistics(): AttractorStatistics {
    const statsPtr = this.wasm.AttractorEngine.prototype.getStatistics.call(this.engine);
    const stats = this.extractFloat32ArrayFromMemory(statsPtr, 7);
    
    return {
      totalSteps: stats[0],
      sideFlipCount: stats[1],
      pointCount: stats[2],
      currentX: stats[3],
      currentY: stats[4],
      currentZ: stats[5],
      currentSide: stats[6]
    };
  }
  
  /**
   * Update configuration
   */
  updateConfig(newConfig: AttractorConfig): void {
    this.config = newConfig;
    const configPtr = this.createConfigPointer();
    
    this.wasm.AttractorEngine.prototype.updateConfig.call(this.engine, configPtr);
    this.wasm.__unpin(configPtr);
  }
  
  /**
   * Reset engine state
   */
  reset(): void {
    this.wasm.AttractorEngine.prototype.reset.call(this.engine);
  }
  
  /**
   * Get current configuration
   */
  getConfig(): AttractorConfig {
    return { ...this.config };
  }
  
  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.engine) {
      // Clean up WASM instance if needed
      this.engine = 0;
    }
  }
  
  /**
   * Create WASM pointer for configuration
   */
  private createConfigPointer(): number {
    const configSize = 7 * 4; // 7 floats * 4 bytes each
    const configPtr = this.wasm.__pin(this.wasm.__new(configSize));
    
    // Create Float32Array view
    const configView = new Float32Array(this.wasm.memory.buffer, configPtr, 7);
    
    // Set configuration values
    configView[0] = this.config.seed;
    configView[1] = this.config.stepVector[0];
    configView[2] = this.config.stepVector[1];
    configView[3] = this.config.stepVector[2];
    configView[4] = this.config.initialPosition[0];
    configView[5] = this.config.initialPosition[1];
    configView[6] = this.config.initialPosition[2];
    // Note: sideFlipVariation and globalRotation would need separate handling
    
    return configPtr;
  }
  
  /**
   * Extract points from WASM memory
   */
  private extractPointsFromMemory(ptr: number, count: number): AttractorPoint[] {
    const points: AttractorPoint[] = [];
    const view = new Float32Array(this.wasm.memory.buffer, ptr, count * 4);
    
    for (let i = 0; i < count; i++) {
      const offset = i * 4;
      points.push({
        x: view[offset],
        y: view[offset + 1],
        z: view[offset + 2],
        side: view[offset + 3]
      });
    }
    
    return points;
  }
  
  /**
   * Extract single point from WASM memory
   */
  private extractPointFromMemory(ptr: number): AttractorPoint {
    const view = new Float32Array(this.wasm.memory.buffer, ptr, 4);
    
    return {
      x: view[0],
      y: view[1],
      z: view[2],
      side: view[3]
    };
  }
  
  /**
   * Extract Float32Array from WASM memory
   */
  private extractFloat32ArrayFromMemory(ptr: number, length: number): Float32Array {
    return new Float32Array(this.wasm.memory.buffer, ptr, length);
  }
}

/**
 * Utility class for creating common configurations
 */
export class ConfigBuilder {
  /**
   * Create golden ratio configuration
   */
  static createGoldenRatio(seed: number): AttractorConfig {
    const phi = (1 + Math.sqrt(5)) / 2;
    
    return {
      seed,
      stepVector: [0.1, 0.1 * phi, 0.1 * phi * phi],
      initialPosition: [0, 0, 0],
      sideFlipVariation: SideFlipVariation.FLIP_SMALLEST,
      globalRotation: [1, 0, 0, 0] // Identity quaternion
    };
  }
  
  /**
   * Create random configuration
   */
  static createRandom(seed: number): AttractorConfig {
    // Use seed for deterministic randomness
    const random = new SeededRandom(seed);
    
    return {
      seed,
      stepVector: [
        random.nextFloat(0.05, 0.2),
        random.nextFloat(0.05, 0.2),
        random.nextFloat(0.05, 0.2)
      ],
      initialPosition: [
        random.nextFloat(-0.5, 0.5),
        random.nextFloat(-0.5, 0.5),
        random.nextFloat(-0.5, 0.5)
      ],
      sideFlipVariation: random.nextInt(3) as SideFlipVariation,
      globalRotation: random.nextQuaternion()
    };
  }
  
  /**
   * Create configuration from parameters
   */
  static create(
    seed: number,
    stepVector: Point3D,
    initialPosition: Point3D = [0, 0, 0],
    sideFlipVariation: SideFlipVariation = SideFlipVariation.FLIP_SMALLEST,
    globalRotation: Quaternion = [1, 0, 0, 0]
  ): AttractorConfig {
    return {
      seed,
      stepVector,
      initialPosition,
      sideFlipVariation,
      globalRotation
    };
  }
}

/**
 * Simple seeded random number generator for configuration creation
 */
class SeededRandom {
  private seed: number;
  
  constructor(seed: number) {
    this.seed = seed;
  }
  
  next(): number {
    this.seed = (this.seed * 1664525 + 1013904223) % 2147483647;
    return this.seed / 2147483647;
  }
  
  nextFloat(min: number, max: number): number {
    return min + this.next() * (max - min);
  }
  
  nextInt(max: number): number {
    return Math.floor(this.next() * max);
  }
  
  nextQuaternion(): Quaternion {
    // Generate random unit quaternion using Marsaglia method
    let x1: number, x2: number, x3: number, x4: number, w: number;
    
    do {
      x1 = this.nextFloat(-1, 1);
      x2 = this.nextFloat(-1, 1);
      x3 = this.nextFloat(-1, 1);
      x4 = this.nextFloat(-1, 1);
      w = x1*x1 + x2*x2 + x3*x3 + x4*x4;
    } while (w >= 1);
    
    const scale = Math.sqrt((1 - w) / w);
    return [x1 * scale, x2 * scale, x3 * scale, x4 * scale];
  }
}
