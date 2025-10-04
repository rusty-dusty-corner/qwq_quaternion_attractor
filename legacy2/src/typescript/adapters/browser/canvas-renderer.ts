/**
 * Browser Canvas Renderer
 * 
 * Renders attractor points to HTML5 Canvas element
 */

import { AttractorPoint, BrowserConfig } from '../../core/types';

export class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private pointSize: number;
  private colorScheme: 'side' | 'depth' | 'distance';
  
  constructor(config: BrowserConfig) {
    this.canvas = config.canvas;
    this.ctx = this.canvas.getContext('2d')!;
    this.width = config.width || this.canvas.width;
    this.height = config.height || this.canvas.height;
    this.pointSize = config.pointSize || 2;
    this.colorScheme = config.colorScheme || 'side';
    
    this.setupCanvas();
  }
  
  /**
   * Setup canvas for high DPI displays
   */
  private setupCanvas(): void {
    const dpr = window.devicePixelRatio || 1;
    
    // Set actual size in memory (scaled to account for extra pixel density)
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    
    // Scale the drawing context so everything will work at the higher ratio
    this.ctx.scale(dpr, dpr);
    
    // Set display size (css pixels)
    this.canvas.style.width = this.width + 'px';
    this.canvas.style.height = this.height + 'px';
  }
  
  /**
   * Clear the canvas
   */
  clear(): void {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }
  
  /**
   * Set canvas size
   */
  setSize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.setupCanvas();
  }
  
  /**
   * Render points to canvas
   */
  async render(points: AttractorPoint[]): Promise<void> {
    // Clear previous frame
    this.clear();
    
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
    
    // Set point color based on color scheme
    this.setPointColor(point);
    
    // Draw point
    this.ctx.beginPath();
    this.ctx.arc(screenX, screenY, this.pointSize, 0, 2 * Math.PI);
    this.ctx.fill();
  }
  
  /**
   * Set point color based on color scheme
   */
  private setPointColor(point: AttractorPoint): void {
    switch (this.colorScheme) {
      case 'side':
        // Blue for north hemisphere, magenta for south
        this.ctx.fillStyle = point.side > 0 ? '#00aaff' : '#ff00aa';
        break;
        
      case 'depth':
        // Brightness based on Z coordinate
        const depth = (point.z + 1) / 2; // Normalize to 0-1
        const brightness = Math.floor(depth * 255);
        this.ctx.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness})`;
        break;
        
      case 'distance':
        // Brightness based on distance from origin
        const distance = Math.sqrt(point.x * point.x + point.y * point.y + point.z * point.z);
        const alpha = Math.max(0, 1 - distance / 2); // Fade with distance
        this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        break;
        
      default:
        this.ctx.fillStyle = '#ffffff';
    }
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
    
    // Scale to fit 80% of canvas
    const scaleX = (this.width * 0.8) / maxRange;
    const scaleY = (this.height * 0.8) / maxRange;
    
    return Math.min(scaleX, scaleY);
  }
  
  /**
   * Render with custom projection
   */
  renderWithProjection(
    points: AttractorPoint[], 
    projection: (point: AttractorPoint) => { x: number; y: number }
  ): void {
    this.clear();
    
    for (const point of points) {
      const projected = projection(point);
      
      // Skip points outside canvas bounds
      if (projected.x < 0 || projected.x >= this.width || 
          projected.y < 0 || projected.y >= this.height) {
        continue;
      }
      
      this.setPointColor(point);
      
      this.ctx.beginPath();
      this.ctx.arc(projected.x, projected.y, this.pointSize, 0, 2 * Math.PI);
      this.ctx.fill();
    }
  }
  
  /**
   * Get canvas element
   */
  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }
  
  /**
   * Get canvas context
   */
  getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }
  
  /**
   * Export canvas as image data URL
   */
  toDataURL(format: string = 'image/png', quality?: number): string {
    return this.canvas.toDataURL(format, quality);
  }
  
  /**
   * Download canvas as image file
   */
  download(filename: string = 'attractor.png'): void {
    const link = document.createElement('a');
    link.download = filename;
    link.href = this.canvas.toDataURL();
    link.click();
  }
}
