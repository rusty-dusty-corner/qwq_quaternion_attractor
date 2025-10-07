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
  stereographicProjectionWithSide,
  inverseStereographicProjectionWithSide,
  addVector3D,
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

    // Deterministic evolution without noise
    let iterationCount = 0;

    for (let i = 0; i < renderParams.batchSize; i++) {
      // Apply wind rotation (deterministic)
      currentQuaternion = multiplyQuaternions(currentQuaternion, constants.wind);
      currentQuaternion = normalizeQuaternion(currentQuaternion);

      // Project to 3D space with side information (deterministic)
      const projectionResult = stereographicProjectionWithSide(currentQuaternion);
      const point3D = projectionResult.point;
      const side = projectionResult.side;

      // Apply additive vector scaled by the hemisphere side
      const scaledAdditive = {
        x: constants.additive.x * side,
        y: constants.additive.y * side,
        z: constants.additive.z * side
      };

      // Test if adding the additive would push us outside the sphere
      const testPoint = addVector3D(point3D, scaledAdditive);
      const testDistance = magnitude3D(testPoint);
      
      let finalPoint;
      if (testDistance <= 1.0) {
        // Inside sphere: commit the change
        finalPoint = testPoint;
      } else {
        // Outside sphere: flip the current point (which is close to surface)
        finalPoint = {
          x: -point3D.x,
          y: -point3D.y,
          z: -point3D.z
        };
      }

      // Store the 3D point with side and index information (will be projected to 2D later)
      const pointWithSide = { 
        x: finalPoint.x, 
        y: finalPoint.y, 
        z: finalPoint.z, 
        side: side, 
        index: i 
      };
      points.push(pointWithSide);

      // Update current quaternion for next iteration
      // Use the side from the original projection (before any flipping)
      currentQuaternion = inverseStereographicProjectionWithSide(finalPoint, side);
      
      iterationCount++;
    }

    return points;
  }

  /**
   * Apply camera rotation to 3D points
   */
  private applyCameraRotation(points: any[], cameraRotation: any): any[] {
    return points.map((point) => {
      // Convert 3D point to quaternion for rotation using hemisphere-aware projection
      const side = point.side || (point.w >= 0 ? 1 : -1); // Use stored side or determine from point
      const pointQuaternion = inverseStereographicProjectionWithSide(point, side);
      const rotatedQuaternion = multiplyQuaternions(
        multiplyQuaternions(cameraRotation, pointQuaternion),
        conjugateQuaternion(cameraRotation)
      );
      const rotatedPoint = stereographicProjection(rotatedQuaternion);
      
      // Preserve side and index information
      return {
        x: rotatedPoint.x,
        y: rotatedPoint.y,
        z: rotatedPoint.z,
        side: point.side,  // Preserve original side
        index: point.index // Preserve original index
      };
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
   * Calculate final quaternion state
   */
  private calculateFinalState(
    startQuaternion: any,
    constants: AttractorConstants,
    iterations: number
  ): any {
    let currentQuaternion = { ...startQuaternion };

    for (let i = 0; i < iterations; i++) {
      // Apply wind rotation (deterministic)
      currentQuaternion = multiplyQuaternions(currentQuaternion, constants.wind);
      currentQuaternion = normalizeQuaternion(currentQuaternion);
      
      // Project to 3D space with side information (deterministic)
      const projectionResult = stereographicProjectionWithSide(currentQuaternion);
      const point3D = projectionResult.point;
      const side = projectionResult.side;
      
      // Apply additive vector scaled by the hemisphere side
      const scaledAdditive = {
        x: constants.additive.x * side,
        y: constants.additive.y * side,
        z: constants.additive.z * side
      };

      // Test if adding the additive would push us outside the sphere
      const testPoint = addVector3D(point3D, scaledAdditive);
      const testDistance = magnitude3D(testPoint);
      
      let finalPoint;
      if (testDistance <= 1.0) {
        // Inside sphere: commit the change
        finalPoint = testPoint;
      } else {
        // Outside sphere: flip the current point (which is close to surface)
        finalPoint = {
          x: -point3D.x,
          y: -point3D.y,
          z: -point3D.z
        };
      }
      
      // Use hemisphere-aware projection with the correct side
      currentQuaternion = inverseStereographicProjectionWithSide(finalPoint, side);
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
  private generateColor(point: any, _index: number): string {
    // Create color based on position and index
    const hue = (Math.atan2(point.y, point.x) + Math.PI) / (2 * Math.PI) * 360;
    const saturation = Math.min(100, Math.sqrt(point.x * point.x + point.y * point.y) * 50);
    const lightness = 50;
    
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
