/**
 * Browser Entry Point for Quaternion Attractor
 * 
 * This module provides the browser-compatible API for the quaternion attractor engine.
 * It exports the JavaScript engine and utilities needed for browser usage.
 */

// Import and export the main engine classes
import { JavaScriptAttractorEngine } from '../typescript/core/js-engine';
export { JavaScriptAttractorEngine };
export { 
  BaseAttractorEngine,
  AttractorConstants,
  RenderParameters,
  AttractorResult,
  SideFlipMode,
  ProjectionType,
  createPoint2D,
  createQuaternion,
  createVector3D,
  DEFAULT_CONSTANTS,
  DEFAULT_RENDER_PARAMS
} from '../typescript/core/attractor-engine';

// Export utility functions
export * from '../typescript/core/types';

// Browser-specific utilities
export class BrowserAttractorRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private engine: any; // JavaScriptAttractorEngine

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.engine = new JavaScriptAttractorEngine();
    
    if (!this.ctx) {
      throw new Error('Canvas 2D context not available');
    }
  }

  /**
   * Render attractor points to canvas
   */
  renderAttractor(
    constants: any, // AttractorConstants
    renderParams: any // RenderParameters
  ): void {
    const result = this.engine.generateBatch(constants, renderParams);
    
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Set canvas size based on render parameters
    const size = renderParams.imageSize || { width: 800, height: 600 };
    this.canvas.width = size.width;
    this.canvas.height = size.height;
    
    // Render points
    result.points.forEach((point: any) => {
      this.ctx.fillStyle = point.color;
      this.ctx.globalAlpha = point.alpha;
      
      // Convert normalized coordinates to canvas coordinates
      const x = (point.x + 1) * size.width / 2;
      const y = (point.y + 1) * size.height / 2;
      
      // Draw point
      this.ctx.beginPath();
      this.ctx.arc(x, y, 1, 0, 2 * Math.PI);
      this.ctx.fill();
    });
    
    this.ctx.globalAlpha = 1.0;
  }

  /**
   * Generate PNG data URL
   */
  generatePNGDataURL(): string {
    return this.canvas.toDataURL('image/png');
  }

  /**
   * Download PNG file
   */
  downloadPNG(filename: string = 'attractor.png'): void {
    const link = document.createElement('a');
    link.download = filename;
    link.href = this.generatePNGDataURL();
    link.click();
  }
}

// Browser-specific constants for easy setup
export const DEFAULT_ATTRACTOR_CONSTANTS: any = {
  start: { w: 0.1, x: 0.2, y: 0.3, z: 0.4 },
  wind: { w: 0.99, x: 0.01, y: 0.01, z: 0.01 },
  additive: { x: 0.1, y: 0.1, z: 0.1 },
  mode: 2 // SideFlipMode.FLIP_ALL_EXCEPT_LARGEST
};

export const DEFAULT_RENDER_PARAMETERS: any = {
  batchSize: 1000,
  imageSize: { width: 800, height: 600 },
  projectionType: 'simple', // ProjectionType.SIMPLE
  cameraRotation: { w: 1, x: 0, y: 0, z: 0 }
};
