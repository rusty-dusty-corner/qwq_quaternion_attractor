/**
 * TypeScript Type Definitions
 * 
 * Shared types between WASM and TypeScript adapters
 */

// Basic mathematical types
export type Quaternion = [number, number, number, number]; // [w, x, y, z]
export type Point3D = [number, number, number];           // [x, y, z]
export type Vector3D = [number, number, number];          // [x, y, z]

// Side flip variation enum
export enum SideFlipVariation {
  PLAIN_FLIP = 0,
  FLIP_SMALLEST = 1,
  FLIP_ALL_EXCEPT_LARGEST = 2
}

// Attractor configuration
export interface AttractorConfig {
  seed: number;
  stepVector: Point3D;           // [a, b, c]
  initialPosition: Point3D;      // [x, y, z]
  sideFlipVariation: SideFlipVariation;
  globalRotation: Quaternion;    // [w, x, y, z]
}

// Generated point data
export interface AttractorPoint {
  x: number;
  y: number;
  z: number;
  side: number;  // +1 for north hemisphere, -1 for south
}

// Engine statistics
export interface AttractorStatistics {
  totalSteps: number;
  sideFlipCount: number;
  pointCount: number;
  currentX: number;
  currentY: number;
  currentZ: number;
  currentSide: number;
}

// WASM module interface
export interface WasmModule {
  // Memory management
  __new(size: number): number;
  __pin(ptr: number): number;
  __unpin(ptr: number): void;
  __collect(): void;
  
  // Quaternion math functions
  normalizeQuaternion(ptr: number): number;
  quaternionMultiply(q1Ptr: number, q2Ptr: number): number;
  stereographicProjection(qPtr: number): number;
  inverseStereographicProjection(pPtr: number): number;
  rotateVector(vPtr: number, qPtr: number): number;
  distance3D(p1Ptr: number, p2Ptr: number): number;
  magnitude3D(vPtr: number): number;
  
  // Random number generator
  DeterministicRandom: {
    new(seed: number): number;
  };
  DeterministicRandom#next(self: number): number;
  DeterministicRandom#nextFloat(self: number, min: number, max: number): number;
  DeterministicRandom#nextInt(self: number, max: number): number;
  DeterministicRandom#nextBoolean(self: number): boolean;
  DeterministicRandom#nextPointOnSphere(self: number): number;
  DeterministicRandom#nextQuaternion(self: number): number;
  DeterministicRandom#getSeed(self: number): number;
  DeterministicRandom#setSeed(self: number, seed: number): void;
  
  // Attractor engine
  AttractorEngine: {
    new(maxPoints: number, configPtr: number): number;
  };
  AttractorEngine#generatePoints(self: number, count: number): void;
  AttractorEngine#getPoints(self: number): number;
  AttractorEngine#getPointCount(self: number): number;
  AttractorEngine#getPointRange(self: number, start: number, count: number): number;
  AttractorEngine#getCurrentState(self: number): number;
  AttractorEngine#getStatistics(self: number): number;
  AttractorEngine#updateConfig(self: number, configPtr: number): void;
  AttractorEngine#reset(self: number): void;
  
  // Float32Array utilities
  Float32Array: {
    new(size: number): number;
  };
  Float32Array#get(index: number): number;
  Float32Array#set(index: number, value: number): void;
  Float32Array#get length(): number;
}

// Platform-specific renderer interfaces
export interface Renderer {
  render(points: AttractorPoint[]): Promise<void>;
  clear(): void;
  setSize(width: number, height: number): void;
}

export interface ImageRenderer extends Renderer {
  saveToFile(filename: string): Promise<void>;
  getImageData(): Uint8Array;
}

// Browser-specific types
export interface BrowserConfig {
  canvas: HTMLCanvasElement;
  width?: number;
  height?: number;
  pointSize?: number;
  colorScheme?: 'side' | 'depth' | 'distance';
}

// Node.js-specific types
export interface NodeConfig {
  outputPath: string;
  width?: number;
  height?: number;
  format?: 'png' | 'jpeg' | 'svg';
  quality?: number;
}

// CLI configuration
export interface CLIConfig extends AttractorConfig {
  outputFile?: string;
  width?: number;
  height?: number;
  pointCount?: number;
  format?: 'png' | 'jpeg' | 'svg' | 'json' | 'csv';
  verbose?: boolean;
}

// Test configuration
export interface TestConfig {
  seed: number;
  expectedPoints: number;
  expectedSideFlips: number;
  tolerance: number;
}
