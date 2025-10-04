/**
 * Browser Attractor Implementation
 * 
 * High-level interface for running attractor in browser environment
 */

import { AttractorConfig, AttractorPoint } from '../../core/types';
import { AttractorWrapper, ConfigBuilder } from '../../core/attractor-wrapper';
import { wasmLoader } from '../../core/wasm-loader';
import { CanvasRenderer } from './canvas-renderer';

export interface BrowserAttractorConfig extends AttractorConfig {
  canvas: HTMLCanvasElement;
  width?: number;
  height?: number;
  pointSize?: number;
  colorScheme?: 'side' | 'depth' | 'distance';
  autoScale?: boolean;
  animationSpeed?: number;
}

export class BrowserAttractor {
  private wrapper: AttractorWrapper;
  private renderer: CanvasRenderer;
  private config: BrowserAttractorConfig;
  private animationId: number | null = null;
  private isAnimating = false;
  
  constructor(config: BrowserAttractorConfig) {
    this.config = config;
    
    // Initialize renderer
    this.renderer = new CanvasRenderer({
      canvas: config.canvas,
      width: config.width,
      height: config.height,
      pointSize: config.pointSize,
      colorScheme: config.colorScheme
    });
    
    // Initialize WASM wrapper (will be loaded asynchronously)
    this.wrapper = null as any; // Will be set in initialize()
  }
  
  /**
   * Initialize the attractor (load WASM module)
   */
  async initialize(): Promise<void> {
    try {
      const wasm = await wasmLoader.load();
      this.wrapper = new AttractorWrapper(wasm, this.config, 100000);
    } catch (error) {
      throw new Error(`Failed to initialize browser attractor: ${error}`);
    }
  }
  
  /**
   * Generate and render points
   */
  async generateAndRender(pointCount: number): Promise<void> {
    if (!this.wrapper) {
      await this.initialize();
    }
    
    // Generate points in WASM
    this.wrapper.generatePoints(pointCount);
    
    // Get points and render
    const points = this.wrapper.getPoints();
    await this.renderer.render(points);
  }
  
  /**
   * Start animation
   */
  async startAnimation(pointCount: number = 1000, speed: number = 50): Promise<void> {
    if (this.isAnimating) {
      this.stopAnimation();
    }
    
    if (!this.wrapper) {
      await this.initialize();
    }
    
    this.isAnimating = true;
    let currentCount = 0;
    const increment = Math.max(1, Math.floor(pointCount / 100));
    
    const animate = () => {
      if (!this.isAnimating) return;
      
      currentCount = Math.min(currentCount + increment, pointCount);
      this.wrapper.generatePoints(currentCount);
      
      const points = this.wrapper.getPoints();
      this.renderer.render(points);
      
      if (currentCount < pointCount) {
        this.animationId = window.setTimeout(animate, speed);
      } else {
        this.isAnimating = false;
      }
    };
    
    animate();
  }
  
  /**
   * Stop animation
   */
  stopAnimation(): void {
    this.isAnimating = false;
    if (this.animationId !== null) {
      window.clearTimeout(this.animationId);
      this.animationId = null;
    }
  }
  
  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<AttractorConfig>): void {
    if (!this.wrapper) return;
    
    const updatedConfig = { ...this.config, ...newConfig };
    this.wrapper.updateConfig(updatedConfig);
    this.config = updatedConfig as BrowserAttractorConfig;
  }
  
  /**
   * Reset attractor state
   */
  reset(): void {
    if (this.wrapper) {
      this.wrapper.reset();
      this.renderer.clear();
    }
  }
  
  /**
   * Get current statistics
   */
  getStatistics() {
    return this.wrapper ? this.wrapper.getStatistics() : null;
  }
  
  /**
   * Get current configuration
   */
  getConfig(): BrowserAttractorConfig {
    return { ...this.config };
  }
  
  /**
   * Download current visualization
   */
  download(filename?: string): void {
    this.renderer.download(filename);
  }
  
  /**
   * Get image data URL
   */
  getImageDataURL(): string {
    return this.renderer.toDataURL();
  }
  
  /**
   * Destroy resources
   */
  destroy(): void {
    this.stopAnimation();
    if (this.wrapper) {
      this.wrapper.destroy();
    }
    wasmLoader.unload();
  }
}

/**
 * Utility class for common browser configurations
 */
export class BrowserConfigBuilder {
  /**
   * Create golden ratio configuration for browser
   */
  static createGoldenRatio(seed: number, canvas: HTMLCanvasElement): BrowserAttractorConfig {
    const config = ConfigBuilder.createGoldenRatio(seed);
    
    return {
      ...config,
      canvas,
      width: canvas.width,
      height: canvas.height,
      pointSize: 2,
      colorScheme: 'side',
      autoScale: true,
      animationSpeed: 50
    };
  }
  
  /**
   * Create random configuration for browser
   */
  static createRandom(seed: number, canvas: HTMLCanvasElement): BrowserAttractorConfig {
    const config = ConfigBuilder.createRandom(seed);
    
    return {
      ...config,
      canvas,
      width: canvas.width,
      height: canvas.height,
      pointSize: 2,
      colorScheme: 'side',
      autoScale: true,
      animationSpeed: 50
    };
  }
  
  /**
   * Create configuration for live performance
   */
  static createPerformance(seed: number, canvas: HTMLCanvasElement): BrowserAttractorConfig {
    const config = ConfigBuilder.createGoldenRatio(seed);
    
    return {
      ...config,
      canvas,
      width: canvas.width,
      height: canvas.height,
      pointSize: 1,
      colorScheme: 'depth',
      autoScale: false,
      animationSpeed: 16 // ~60 FPS
    };
  }
}
