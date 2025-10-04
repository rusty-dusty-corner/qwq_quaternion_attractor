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
  SideFlipMode,
  ProjectionType,
  createPoint2D
} from './attractor-engine';

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
    const normalizedStart = this.normalizeQuaternion(constants.start);
    const normalizedCamera = this.normalizeQuaternion(renderParams.cameraRotation);

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

    for (let i = 0; i < renderParams.batchSize; i++) {
      // Apply wind rotation
      currentQuaternion = this.multiplyQuaternions(currentQuaternion, constants.wind);

      // Project to 3D space
      const point3D = this.stereographicProjection(currentQuaternion);

      // Apply additive vector
      const modifiedPoint = this.addVector3D(point3D, constants.additive);

      // Check if point is outside unit ball and apply side flipping
      const processedPoint = this.applySideFlipping(
        modifiedPoint,
        constants.mode,
        currentQuaternion
      );

      // Store the 3D point (will be projected to 2D later)
      points.push(processedPoint);

      // Update current quaternion for next iteration
      currentQuaternion = this.inverseStereographicProjection(processedPoint);
    }

    return points;
  }

  /**
   * Apply camera rotation to 3D points
   */
  private applyCameraRotation(points: any[], cameraRotation: any): any[] {
    return points.map(point => {
      // Convert 3D point to quaternion for rotation
      const pointQuaternion = this.inverseStereographicProjection(point);
      const rotatedQuaternion = this.multiplyQuaternions(
        this.multiplyQuaternions(cameraRotation, pointQuaternion),
        this.conjugateQuaternion(cameraRotation)
      );
      return this.stereographicProjection(rotatedQuaternion);
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
          const magnitude = Math.sqrt(point.x * point.x + point.y * point.y + point.z * point.z);
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

      return createPoint2D(x, y, color, alpha);
    });
  }

  /**
   * Apply side flipping based on mode
   */
  private applySideFlipping(
    point: any,
    mode: SideFlipMode,
    currentQuaternion: any
  ): any {
    const magnitude = Math.sqrt(point.x * point.x + point.y * point.y + point.z * point.z);

    // If point is inside unit ball, no flipping needed
    if (magnitude <= 1.0) {
      return point;
    }

    // Apply side flipping based on mode
    switch (mode) {
      case SideFlipMode.PLAIN_FLIP:
        // Just flip the hemisphere side
        return this.flipHemisphere(point, currentQuaternion);

      case SideFlipMode.FLIP_SMALLEST:
        // Flip the smallest component
        return this.flipSmallestComponent(point);

      case SideFlipMode.FLIP_ALL_EXCEPT_LARGEST:
        // Flip all components except the largest
        return this.flipAllExceptLargest(point);

      default:
        return point;
    }
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
      currentQuaternion = this.multiplyQuaternions(currentQuaternion, constants.wind);
      const point3D = this.stereographicProjection(currentQuaternion);
      const modifiedPoint = this.addVector3D(point3D, constants.additive);
      
      // Apply side flipping if needed
      const magnitude = Math.sqrt(modifiedPoint.x * modifiedPoint.x + modifiedPoint.y * modifiedPoint.y + modifiedPoint.z * modifiedPoint.z);
      if (magnitude > 1.0) {
        currentQuaternion = this.inverseStereographicProjection(
          this.applySideFlipping(modifiedPoint, constants.mode, currentQuaternion)
        );
      } else {
        currentQuaternion = this.inverseStereographicProjection(modifiedPoint);
      }
    }

    return this.normalizeQuaternion(currentQuaternion);
  }

  // ============================================================================
  // MATHEMATICAL HELPER METHODS
  // ============================================================================

  /**
   * Stereographic projection from 4D to 3D
   */
  private stereographicProjection(quaternion: any): any {
    const { w, x, y, z } = quaternion;

    // Handle north pole singularity
    if (Math.abs(1 - w) < 1e-10) {
      return { x: 0, y: 0, z: 0 };
    }

    const scale = 1 / (1 - w);
    return {
      x: x * scale,
      y: y * scale,
      z: z * scale
    };
  }

  /**
   * Inverse stereographic projection from 3D to 4D
   */
  private inverseStereographicProjection(point: any): any {
    const { x, y, z } = point;
    const r2 = x * x + y * y + z * z;

    // Handle north pole singularity
    if (r2 < 1e-10) {
      return { w: 1, x: 0, y: 0, z: 0 };
    }

    const w = (r2 - 1) / (r2 + 1);
    const scale = 2 / (r2 + 1);

    return {
      w: w,
      x: x * scale,
      y: y * scale,
      z: z * scale
    };
  }

  /**
   * Add two 3D vectors
   */
  private addVector3D(point: any, vector: any): any {
    return {
      x: point.x + vector.x,
      y: point.y + vector.y,
      z: point.z + vector.z
    };
  }

  /**
   * Flip hemisphere side
   */
  private flipHemisphere(_point: any, quaternion: any): any {
    // Simple hemisphere flip - negate the quaternion w component
    const flippedQuaternion = { ...quaternion, w: -quaternion.w };
    return this.stereographicProjection(flippedQuaternion);
  }

  /**
   * Flip smallest component
   */
  private flipSmallestComponent(point: any): any {
    const absX = Math.abs(point.x);
    const absY = Math.abs(point.y);
    const absZ = Math.abs(point.z);

    if (absX <= absY && absX <= absZ) {
      return { ...point, x: -point.x };
    } else if (absY <= absZ) {
      return { ...point, y: -point.y };
    } else {
      return { ...point, z: -point.z };
    }
  }

  /**
   * Flip all components except largest
   */
  private flipAllExceptLargest(point: any): any {
    const absX = Math.abs(point.x);
    const absY = Math.abs(point.y);
    const absZ = Math.abs(point.z);

    if (absX >= absY && absX >= absZ) {
      return { ...point, y: -point.y, z: -point.z };
    } else if (absY >= absZ) {
      return { ...point, x: -point.x, z: -point.z };
    } else {
      return { ...point, x: -point.x, y: -point.y };
    }
  }

  /**
   * Generate conjugate of quaternion
   */
  private conjugateQuaternion(q: any): any {
    return { w: q.w, x: -q.x, y: -q.y, z: -q.z };
  }

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
