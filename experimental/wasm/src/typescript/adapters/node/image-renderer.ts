/**
 * Node.js Image Renderer
 * 
 * Renders attractor points to PNG/JPEG files using Node.js canvas library
 */

import { AttractorPoint, NodeConfig } from '../../core/types';

export class NodeImageRenderer {
  private width: number;
  private height: number;
  private format: 'png' | 'jpeg' | 'svg';
  private quality: number;
  private outputPath: string;
  
  // Canvas will be created dynamically to avoid import issues
  private Canvas: any;
  private canvas: any;
  private ctx: any;
  
  constructor(config: NodeConfig) {
    this.width = config.width || 1920;
    this.height = config.height || 1080;
    this.format = config.format || 'png';
    this.quality = config.quality || 0.9;
    this.outputPath = config.outputPath;
    
    this.initializeCanvas();
  }
  
  /**
   * Initialize canvas library
   */
  private initializeCanvas(): void {
    try {
      // Try to load canvas library
      this.Canvas = require('canvas');
      this.canvas = this.Canvas.createCanvas(this.width, this.height);
      this.ctx = this.canvas.getContext('2d');
    } catch (error) {
      throw new Error(`Canvas library not available. Install with: npm install canvas`);
    }
  }
  
  /**
   * Set canvas size
   */
  setSize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.canvas.width = width;
    this.canvas.height = height;
  }
  
  /**
   * Clear the canvas
   */
  clear(): void {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }
  
  /**
   * Render points to canvas
   */
  async render(points: AttractorPoint[]): Promise<void> {
    // Clear previous frame
    this.clear();
    
    // Set background
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // Calculate bounds for auto-scaling
    const bounds = this.calculateBounds(points);
    const scale = this.calculateScale(bounds);
    
    // Render points
    for (const point of points) {
      this.renderPoint(point, scale);
    }
  }
  
  /**
   * Render a single point
   */
  private renderPoint(point: AttractorPoint, scale: number): void {
    // Project 3D point to 2D screen coordinates
    const screenX = this.width / 2 + point.x * scale;
    const screenY = this.height / 2 - point.y * scale;
    
    // Skip points outside canvas bounds
    if (screenX < 0 || screenX >= this.width || 
        screenY < 0 || screenY >= this.height) {
      return;
    }
    
    // Set point color based on side
    if (point.side > 0) {
      this.ctx.fillStyle = '#00aaff'; // Blue for north hemisphere
    } else {
      this.ctx.fillStyle = '#ff00aa'; // Magenta for south hemisphere
    }
    
    // Draw point
    this.ctx.beginPath();
    this.ctx.arc(screenX, screenY, 2, 0, 2 * Math.PI);
    this.ctx.fill();
  }
  
  /**
   * Calculate bounds of all points
   */
  private calculateBounds(points: AttractorPoint[]): {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  } {
    if (points.length === 0) {
      return { minX: -1, maxX: 1, minY: -1, maxY: 1 };
    }
    
    let minX = points[0].x;
    let maxX = points[0].x;
    let minY = points[0].y;
    let maxY = points[0].y;
    
    for (const point of points) {
      minX = Math.min(minX, point.x);
      maxX = Math.max(maxX, point.x);
      minY = Math.min(minY, point.y);
      maxY = Math.max(maxY, point.y);
    }
    
    return { minX, maxX, minY, maxY };
  }
  
  /**
   * Calculate scale factor for auto-fitting
   */
  private calculateScale(bounds: { minX: number; maxX: number; minY: number; maxY: number }): number {
    const rangeX = bounds.maxX - bounds.minX;
    const rangeY = bounds.maxY - bounds.minY;
    const maxRange = Math.max(rangeX, rangeY);
    
    if (maxRange === 0) return 100;
    
    // Scale to fit 90% of canvas
    const scaleX = (this.width * 0.9) / maxRange;
    const scaleY = (this.height * 0.9) / maxRange;
    
    return Math.min(scaleX, scaleY);
  }
  
  /**
   * Save canvas to file
   */
  async saveToFile(filename?: string): Promise<void> {
    const fs = require('fs').promises;
    const path = require('path');
    
    const outputFile = filename || this.outputPath;
    const outputDir = path.dirname(outputFile);
    
    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });
    
    // Save based on format
    switch (this.format) {
      case 'png':
        const pngBuffer = this.canvas.toBuffer('image/png');
        await fs.writeFile(outputFile, pngBuffer);
        break;
        
      case 'jpeg':
        const jpegBuffer = this.canvas.toBuffer('image/jpeg', { quality: this.quality });
        await fs.writeFile(outputFile, jpegBuffer);
        break;
        
      case 'svg':
        // SVG would require different implementation
        throw new Error('SVG format not implemented yet');
        
      default:
        throw new Error(`Unsupported format: ${this.format}`);
    }
  }
  
  /**
   * Get image buffer
   */
  getImageBuffer(): Buffer {
    switch (this.format) {
      case 'png':
        return this.canvas.toBuffer('image/png');
      case 'jpeg':
        return this.canvas.toBuffer('image/jpeg', { quality: this.quality });
      default:
        return this.canvas.toBuffer('image/png');
    }
  }
  
  /**
   * Get canvas dimensions
   */
  getDimensions(): { width: number; height: number } {
    return { width: this.width, height: this.height };
  }
}
