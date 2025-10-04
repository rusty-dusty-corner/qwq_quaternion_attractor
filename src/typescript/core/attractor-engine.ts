/**
 * Main Attractor Engine Implementation
 * 
 * This is the core interface that will be implemented by both:
 * - WebAssembly engine (high-performance)
 * - JavaScript fallback engine (universal compatibility)
 */

import {
  AttractorEngine,
  AttractorConstants,
  RenderParameters,
  AttractorResult,
  ValidationResult,
  DEFAULT_CONSTANTS,
  DEFAULT_RENDER_PARAMS,
  normalizeQuaternion,
  multiplyQuaternions,
  SideFlipMode,
  ProjectionType
} from './types';

// Re-export types and utilities for convenience
export {
  AttractorEngine,
  AttractorConstants,
  RenderParameters,
  AttractorResult,
  ValidationResult,
  SideFlipMode,
  ProjectionType,
  createQuaternion,
  createVector3D,
  createPoint2D,
  normalizeQuaternion,
  multiplyQuaternions,
  DEFAULT_CONSTANTS,
  DEFAULT_RENDER_PARAMS
} from './types';

// ============================================================================
// ABSTRACT BASE ENGINE
// ============================================================================

/**
 * Abstract base class for attractor engines
 */
export abstract class BaseAttractorEngine implements AttractorEngine {
  /**
   * Generate a batch of 2D points from the attractor
   */
  abstract generateBatch(
    constants: AttractorConstants,
    renderParams: RenderParameters
  ): AttractorResult;

  /**
   * Generate multiple batches for animation or large point sets
   */
  generateMultipleBatches(
    constants: AttractorConstants,
    renderParams: RenderParameters,
    batchCount: number
  ): AttractorResult[] {
    const results: AttractorResult[] = [];
    let currentState = constants.start;

    for (let i = 0; i < batchCount; i++) {
      // Update constants with current state as new starting point
      const updatedConstants = { ...constants, start: currentState };
      
      const result = this.generateBatch(updatedConstants, renderParams);
      results.push(result);
      
      // Use final quaternion as starting point for next batch
      currentState = result.finalQuaternion;
    }

    return results;
  }

  /**
   * Validate parameters before processing
   */
  validateParameters(
    constants: AttractorConstants,
    renderParams: RenderParameters
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate constants
    if (!this.isValidQuaternion(constants.start)) {
      errors.push('Invalid start quaternion');
    }

    if (!this.isValidVector3D(constants.additive)) {
      errors.push('Invalid additive vector');
    }

    if (!this.isValidQuaternion(constants.wind)) {
      errors.push('Invalid wind quaternion');
    }

    if (!Object.values(SideFlipMode).includes(constants.mode)) {
      errors.push(`Invalid mode: ${constants.mode}. Must be 0, 1, or 2`);
    }

    // Validate render parameters
    if (!Object.values(ProjectionType).includes(renderParams.projectionType)) {
      errors.push(`Invalid projection type: ${renderParams.projectionType}`);
    }

    if (!this.isValidQuaternion(renderParams.cameraRotation)) {
      errors.push('Invalid camera rotation quaternion');
    }

    if (renderParams.batchSize <= 0 || renderParams.batchSize > 10000) {
      errors.push('Batch size must be between 1 and 10000');
    }

    // Add warnings for extreme values
    if (renderParams.batchSize > 1000) {
      warnings.push('Large batch sizes may impact performance');
    }

    if (this.getQuaternionMagnitude(constants.start) < 0.1) {
      warnings.push('Very small start quaternion magnitude may cause numerical issues');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // ============================================================================
  // PROTECTED UTILITY METHODS
  // ============================================================================

  protected isValidQuaternion(q: any): boolean {
    return (
      typeof q === 'object' &&
      q !== null &&
      typeof q.w === 'number' &&
      typeof q.x === 'number' &&
      typeof q.y === 'number' &&
      typeof q.z === 'number' &&
      !isNaN(q.w) && !isNaN(q.x) && !isNaN(q.y) && !isNaN(q.z)
    );
  }

  protected isValidVector3D(v: any): boolean {
    return (
      typeof v === 'object' &&
      v !== null &&
      typeof v.x === 'number' &&
      typeof v.y === 'number' &&
      typeof v.z === 'number' &&
      !isNaN(v.x) && !isNaN(v.y) && !isNaN(v.z)
    );
  }

  protected getQuaternionMagnitude(q: any): number {
    if (!this.isValidQuaternion(q)) return 0;
    return Math.sqrt(q.w * q.w + q.x * q.x + q.y * q.y + q.z * q.z);
  }

  protected normalizeQuaternion(q: any): any {
    if (!this.isValidQuaternion(q)) return DEFAULT_CONSTANTS.start;
    return normalizeQuaternion(q);
  }

  protected multiplyQuaternions(q1: any, q2: any): any {
    if (!this.isValidQuaternion(q1) || !this.isValidQuaternion(q2)) {
      return DEFAULT_CONSTANTS.start;
    }
    return multiplyQuaternions(q1, q2);
  }
}

// ============================================================================
// ENGINE FACTORY
// ============================================================================

/**
 * Engine type enumeration
 */
export enum EngineType {
  WASM = 'wasm',
  JAVASCRIPT = 'javascript'
}

/**
 * Configuration for engine creation
 */
export interface EngineConfig {
  type: EngineType;
  wasmPath?: string;  // Path to WASM file for WASM engine
  fallbackToJS?: boolean;  // Whether to fallback to JS if WASM fails
}

/**
 * Factory function to create the appropriate engine
 */
export async function createAttractorEngine(config: EngineConfig): Promise<AttractorEngine> {
  switch (config.type) {
    case EngineType.WASM:
      try {
        // TODO: Import and create WASM engine
        // const WasmEngine = await import('./wasm-engine');
        // return new WasmEngine.WasmAttractorEngine(config.wasmPath);
        throw new Error('WASM engine not yet implemented');
      } catch (error) {
        if (config.fallbackToJS) {
          console.warn('WASM engine failed, falling back to JavaScript:', error);
          return createAttractorEngine({ type: EngineType.JAVASCRIPT });
        }
        throw error;
      }

    case EngineType.JAVASCRIPT:
      const JSEngine = await import('./js-engine');
      return new JSEngine.JavaScriptAttractorEngine();

    default:
      throw new Error(`Unknown engine type: ${config.type}`);
  }
}

/**
 * Default engine configuration
 */
export const DEFAULT_ENGINE_CONFIG: EngineConfig = {
  type: EngineType.WASM,
  fallbackToJS: true
};

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Create engine with default configuration
 */
export async function createDefaultEngine(): Promise<AttractorEngine> {
  return createAttractorEngine(DEFAULT_ENGINE_CONFIG);
}

/**
 * Quick generation function with default parameters
 */
export async function generateAttractorPoints(
  pointCount: number = 100,
  constants?: Partial<AttractorConstants>,
  renderParams?: Partial<RenderParameters>
): Promise<AttractorResult> {
  const engine = await createDefaultEngine();
  
  const finalConstants = { ...DEFAULT_CONSTANTS, ...constants };
  const finalRenderParams = { ...DEFAULT_RENDER_PARAMS, ...renderParams, batchSize: pointCount };
  
  return engine.generateBatch(finalConstants, finalRenderParams);
}

/**
 * Generate points for animation with chaining
 */
export async function generateAnimationFrames(
  frameCount: number,
  pointsPerFrame: number,
  constants?: Partial<AttractorConstants>,
  renderParams?: Partial<RenderParameters>
): Promise<AttractorResult[]> {
  const engine = await createDefaultEngine();
  
  const finalConstants = { ...DEFAULT_CONSTANTS, ...constants };
  const finalRenderParams = { ...DEFAULT_RENDER_PARAMS, ...renderParams, batchSize: pointsPerFrame };
  
  return engine.generateMultipleBatches(finalConstants, finalRenderParams, frameCount);
}
