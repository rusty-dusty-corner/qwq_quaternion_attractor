/**
 * Node.js Attractor Implementation
 * 
 * High-level interface for running attractor in Node.js environment
 */

import { AttractorConfig } from '../../core/types';
import { AttractorWrapper, ConfigBuilder } from '../../core/attractor-wrapper';
import { wasmLoader } from '../../core/wasm-loader';
import { NodeImageRenderer } from './image-renderer';
import { NodeConfig } from '../../core/types';

export interface NodeAttractorConfig extends AttractorConfig {
  outputPath: string;
  width?: number;
  height?: number;
  format?: 'png' | 'jpeg' | 'svg';
  quality?: number;
}

export class NodeAttractor {
  private wrapper: AttractorWrapper;
  private renderer: NodeImageRenderer;
  private config: NodeAttractorConfig;
  
  constructor(config: NodeAttractorConfig) {
    this.config = config;
    
    // Initialize renderer
    this.renderer = new NodeImageRenderer({
      outputPath: config.outputPath,
      width: config.width,
      height: config.height,
      format: config.format,
      quality: config.quality
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
      throw new Error(`Failed to initialize Node.js attractor: ${error}`);
    }
  }
  
  /**
   * Generate points and save to file
   */
  async generateAndSave(
    pointCount: number, 
    filename?: string
  ): Promise<void> {
    if (!this.wrapper) {
      await this.initialize();
    }
    
    console.log(`Generating ${pointCount} points...`);
    const startTime = Date.now();
    
    // Generate points in WASM
    this.wrapper.generatePoints(pointCount);
    
    const generationTime = Date.now() - startTime;
    console.log(`Generation completed in ${generationTime}ms`);
    
    // Get points and render
    const points = this.wrapper.getPoints();
    console.log(`Rendering ${points.length} points...`);
    
    await this.renderer.render(points);
    await this.renderer.saveToFile(filename);
    
    const totalTime = Date.now() - startTime;
    console.log(`Total processing time: ${totalTime}ms`);
    
    // Log statistics
    const stats = this.wrapper.getStatistics();
    console.log(`Statistics:`);
    console.log(`  Total steps: ${stats.totalSteps}`);
    console.log(`  Side flips: ${stats.sideFlipCount}`);
    console.log(`  Points generated: ${stats.pointCount}`);
  }
  
  /**
   * Generate points and return as buffer
   */
  async generateAndGetBuffer(pointCount: number): Promise<Buffer> {
    if (!this.wrapper) {
      await this.initialize();
    }
    
    // Generate points in WASM
    this.wrapper.generatePoints(pointCount);
    
    // Get points and render
    const points = this.wrapper.getPoints();
    await this.renderer.render(points);
    
    return this.renderer.getImageBuffer();
  }
  
  /**
   * Generate multiple images with different seeds
   */
  async generateBatch(
    seeds: number[],
    pointCount: number,
    outputDir: string
  ): Promise<void> {
    const fs = require('fs').promises;
    const path = require('path');
    
    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });
    
    console.log(`Generating ${seeds.length} images...`);
    
    for (let i = 0; i < seeds.length; i++) {
      const seed = seeds[i];
      console.log(`Processing seed ${seed} (${i + 1}/${seeds.length})`);
      
      // Update configuration with new seed
      const newConfig = { ...this.config, seed };
      this.wrapper.updateConfig(newConfig);
      
      // Generate and save
      const filename = path.join(outputDir, `attractor_seed_${seed}.png`);
      await this.generateAndSave(pointCount, filename);
    }
    
    console.log(`Batch generation completed. ${seeds.length} images saved to ${outputDir}`);
  }
  
  /**
   * Generate animation frames
   */
  async generateAnimation(
    pointCount: number,
    frameCount: number,
    outputDir: string
  ): Promise<void> {
    const fs = require('fs').promises;
    const path = require('path');
    
    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });
    
    console.log(`Generating ${frameCount} animation frames...`);
    
    const pointsPerFrame = Math.floor(pointCount / frameCount);
    
    for (let frame = 0; frame < frameCount; frame++) {
      const currentPointCount = pointsPerFrame * (frame + 1);
      console.log(`Generating frame ${frame + 1}/${frameCount} (${currentPointCount} points)`);
      
      // Generate points up to current frame
      this.wrapper.generatePoints(currentPointCount);
      
      // Get points and render
      const points = this.wrapper.getPoints();
      await this.renderer.render(points);
      
      // Save frame
      const filename = path.join(outputDir, `frame_${frame.toString().padStart(4, '0')}.png`);
      await this.renderer.saveToFile(filename);
    }
    
    console.log(`Animation generation completed. ${frameCount} frames saved to ${outputDir}`);
  }
  
  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<AttractorConfig>): void {
    if (!this.wrapper) return;
    
    const updatedConfig = { ...this.config, ...newConfig };
    this.wrapper.updateConfig(updatedConfig);
    this.config = updatedConfig as NodeAttractorConfig;
  }
  
  /**
   * Reset attractor state
   */
  reset(): void {
    if (this.wrapper) {
      this.wrapper.reset();
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
  getConfig(): NodeAttractorConfig {
    return { ...this.config };
  }
  
  /**
   * Destroy resources
   */
  destroy(): void {
    if (this.wrapper) {
      this.wrapper.destroy();
    }
    wasmLoader.unload();
  }
}

/**
 * Utility class for common Node.js configurations
 */
export class NodeConfigBuilder {
  /**
   * Create golden ratio configuration for Node.js
   */
  static createGoldenRatio(seed: number, outputPath: string): NodeAttractorConfig {
    const config = ConfigBuilder.createGoldenRatio(seed);
    
    return {
      ...config,
      outputPath,
      width: 1920,
      height: 1080,
      format: 'png',
      quality: 0.9
    };
  }
  
  /**
   * Create high-quality configuration
   */
  static createHighQuality(seed: number, outputPath: string): NodeAttractorConfig {
    const config = ConfigBuilder.createGoldenRatio(seed);
    
    return {
      ...config,
      outputPath,
      width: 3840,
      height: 2160, // 4K
      format: 'png',
      quality: 1.0
    };
  }
  
  /**
   * Create configuration for batch processing
   */
  static createBatch(seed: number, outputDir: string): NodeAttractorConfig {
    const config = ConfigBuilder.createRandom(seed);
    
    return {
      ...config,
      outputPath: outputDir,
      width: 1920,
      height: 1080,
      format: 'png',
      quality: 0.9
    };
  }
}
