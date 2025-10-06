/**
 * JavaScript Implementation of the Attractor Engine
 * 
 * This is a fallback implementation that provides the same API
 * as the WebAssembly version but runs in pure JavaScript.
 * Useful for testing and environments where WASM is not available.
 */

import {
  BaseAttractorEngine,
  AttractorConstants,
  RenderParameters,
  AttractorResult,
  ProjectionType,
  createPoint2D
} from './attractor-engine';
import {
  normalizeQuaternion,
  multiplyQuaternions,
  conjugateQuaternion,
  stereographicProjection,
  inverseStereographicProjection,
  inverseStereographicProjectionWithSide,
  addVector3D,
  applySideFlipping,
  magnitude3D
} from '../../shared/quaternion-math';

// ============================================================================
// JAVASCRIPT ATTRACTOR ENGINE
// ============================================================================

export class JavaScriptAttractorEngine extends BaseAttractorEngine {

  /**
   * Generate a batch of 2D points from the attractor
   */
  generateBatch(
    constants: AttractorConstants,
    renderParams: RenderParameters
  ): AttractorResult {
    const startTime = performance.now();
    
    // Validate parameters first
    const validation = this.validateParameters(constants, renderParams);
    if (!validation.isValid) {
      throw new Error(`Invalid parameters: ${validation.errors.join(', ')}`);
    }

    // Normalize input quaternions
    const normalizedStart = normalizeQuaternion(constants.start);
    const normalizedCamera = normalizeQuaternion(renderParams.cameraRotation);

    // Generate points
    const points = this.generateAttractorPoints(
      normalizedStart,
      constants,
      renderParams
    );

    // Apply camera rotation if needed
    const rotatedPoints = this.applyCameraRotation(points, normalizedCamera);

    // Apply projection
    const projectedPoints = this.applyProjection(
      rotatedPoints,
      renderParams.projectionType
    );

    const endTime = performance.now();
    const computationTime = endTime - startTime;

    // Calculate final quaternion state
    const finalQuaternion = this.calculateFinalState(
      normalizedStart,
      constants,
      renderParams.batchSize
    );

    return {
      points: projectedPoints,
      finalQuaternion,
      metadata: {
        iterations: renderParams.batchSize,
        computationTime,
        memoryUsage: this.estimateMemoryUsage(renderParams.batchSize)
      }
    };
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  /**
   * Generate attractor points using the core algorithm
   */
  private generateAttractorPoints(
    startQuaternion: any,
    constants: AttractorConstants,
    renderParams: RenderParameters
  ): any[] {
    const points: any[] = [];
    let currentQuaternion = { ...startQuaternion };

    // Add some randomness to prevent convergence to fixed points
    const baseNoiseFactor = 0.01; // Increased noise factor
    let iterationCount = 0;

    for (let i = 0; i < renderParams.batchSize; i++) {
      // Apply wind rotation
      currentQuaternion = multiplyQuaternions(currentQuaternion, constants.wind);

      // Add progressive noise to prevent convergence - more noise for higher iteration counts
      if (i % 50 === 0 && i > 0) {
        const progressFactor = Math.min(1.0, i / 1000); // Increase noise as we progress
        const noiseFactor = baseNoiseFactor * (1 + progressFactor);
        
        const noise = {
          w: 1.0 + (Math.random() - 0.5) * noiseFactor,
          x: (Math.random() - 0.5) * noiseFactor,
          y: (Math.random() - 0.5) * noiseFactor,
          z: (Math.random() - 0.5) * noiseFactor
        };
        currentQuaternion = multiplyQuaternions(currentQuaternion, noise);
        currentQuaternion = normalizeQuaternion(currentQuaternion);
      }

      // Additional perturbation every 200 iterations for high iteration counts
      if (i > 1000 && i % 200 === 0) {
        const perturbation = {
          w: 1.0 + (Math.random() - 0.5) * 0.05,
          x: (Math.random() - 0.5) * 0.05,
          y: (Math.random() - 0.5) * 0.05,
          z: (Math.random() - 0.5) * 0.05
        };
        currentQuaternion = multiplyQuaternions(currentQuaternion, perturbation);
        currentQuaternion = normalizeQuaternion(currentQuaternion);
      }

      // Determine side based on the sign of the w component of the current quaternion
      // This matches the original WASM implementation: side = (quat.w >= 0) ? +1 : -1
      const side = currentQuaternion.w >= 0 ? 1 : -1;

      // Project to 3D space (this gives us coordinates on the infinite plane)
      const point3D = stereographicProjection(currentQuaternion);

      // Apply additive vector in 3D space (matching WASM implementation)
      // The additive vector is applied to 3D coordinates, not quaternion coordinates
      const modifiedPoint = addVector3D(point3D, constants.additive);

      // Check if point is outside unit ball and apply side flipping
      const processedPoint = applySideFlipping(
        modifiedPoint,
        constants.mode,
        currentQuaternion
      );

      // Determine if hemisphere was flipped by checking if point was outside unit ball
      const wasOutsideUnitBall = magnitude3D(modifiedPoint) > 1.0;
      const finalSide = wasOutsideUnitBall ? -side : side; // Flip side if hemisphere was flipped

      // Store the 3D point with side and index information (will be projected to 2D later)
      points.push({ ...processedPoint, side: finalSide, index: i });

      // Update current quaternion for next iteration
      // Pass the FINAL side information to the inverse projection to maintain hemisphere consistency
      currentQuaternion = this.inverseStereographicProjectionWithSide(processedPoint, finalSide);
      
      iterationCount++;
    }

    return points;
  }

  /**
   * Apply camera rotation to 3D points
   */
  private applyCameraRotation(points: any[], cameraRotation: any): any[] {
    return points.map(point => {
      // Convert 3D point to quaternion for rotation using hemisphere-aware projection
      const side = point.side || (point.w >= 0 ? 1 : -1); // Use stored side or determine from point
      const pointQuaternion = inverseStereographicProjectionWithSide(point, side);
      const rotatedQuaternion = multiplyQuaternions(
        multiplyQuaternions(cameraRotation, pointQuaternion),
        conjugateQuaternion(cameraRotation)
      );
      return stereographicProjection(rotatedQuaternion);
    });
  }

  /**
   * Apply projection (simple 2D or sphere projection)
   */
  private applyProjection(points: any[], projectionType: ProjectionType): any[] {
    return points.map((point, index) => {
      let x: number, y: number;

      switch (projectionType) {
        case ProjectionType.SIMPLE:
          // Simple 2D projection - use X and Y coordinates
          x = point.x;
          y = point.y;
          break;

        case ProjectionType.SPHERE:
          // Sphere projection - rotate 3D point then project
          const magnitude = magnitude3D(point);
          if (magnitude === 0) {
            x = y = 0;
          } else {
            // Simple sphere-to-2D projection
            x = point.x * (1 + point.z / magnitude);
            y = point.y * (1 + point.z / magnitude);
          }
          break;

        default:
          x = point.x;
          y = point.y;
      }

      // Add some color variation based on position and index
      const color = this.generateColor(point, index);
      const alpha = Math.max(0.1, 1.0 - Math.sqrt(point.x * point.x + point.y * point.y) / 2.0);

      // Use side information from the point (already determined before flipping)
      const side = point.side || 1; // Default to 1 if side not set

      return createPoint2D(x, y, color, alpha, side, index);
    });
  }

  // Note: applySideFlipping is now handled by shared/quaternion-math.ts

  /**
   * Inverse stereographic projection with hemisphere support
   * Matches the WASM implementation for proper side handling
   */
  private inverseStereographicProjectionWithSide(point: any, side: number): any {
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
   * Calculate final quaternion state
   */
  private calculateFinalState(
    startQuaternion: any,
    constants: AttractorConstants,
    iterations: number
  ): any {
    let currentQuaternion = { ...startQuaternion };

    for (let i = 0; i < iterations; i++) {
      currentQuaternion = multiplyQuaternions(currentQuaternion, constants.wind);
      const point3D = stereographicProjection(currentQuaternion);
      const modifiedPoint = addVector3D(point3D, constants.additive);
      
      // Apply side flipping if needed
      const magnitude = magnitude3D(modifiedPoint);
      if (magnitude > 1.0) {
        currentQuaternion = inverseStereographicProjection(
          applySideFlipping(modifiedPoint, constants.mode, currentQuaternion)
        );
      } else {
        // Use hemisphere-aware projection with current side
        const side = currentQuaternion.w >= 0 ? 1 : -1;
        currentQuaternion = inverseStereographicProjectionWithSide(modifiedPoint, side);
      }
    }

    return normalizeQuaternion(currentQuaternion);
  }

  // ============================================================================
  // MATHEMATICAL HELPER METHODS
  // ============================================================================
  // Note: Mathematical operations are now handled by shared/quaternion-math.ts

  /**
   * Generate color for point based on position and index
   */
  private generateColor(point: any, index: number): string {
    // Create color based on position and index
    const hue = (Math.atan2(point.y, point.x) + Math.PI) / (2 * Math.PI) * 360;
    const saturation = Math.min(100, Math.sqrt(point.x * point.x + point.y * point.y) * 50);
    const lightness = 50 + Math.sin(index * 0.1) * 20;
    
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }

  /**
   * Estimate memory usage
   */
  private estimateMemoryUsage(pointCount: number): number {
    // Rough estimate: each point ~100 bytes, quaternions ~64 bytes each
    return pointCount * 100 + pointCount * 64;
  }
}
