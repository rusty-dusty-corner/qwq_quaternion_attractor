/**
 * Simple PNG Image Renderer for Quaternion Attractor Points
 * 
 * This renderer:
 * 1. Aggregates 2D points from batches
 * 2. Creates a 2D float RGB grid
 * 3. Calculates statistics (min, max, stdev)
 * 4. Transforms to 256 RGB values
 * 5. Generates PNG output
 */

import { Point2D } from '../core/types';

// ============================================================================
// TYPES
// ============================================================================

export interface ImageConfig {
  width: number;
  height: number;
  scale: number;        // Scale factor for point coordinates
  offsetX: number;      // X offset for centering
  offsetY: number;      // Y offset for centering
  blurRadius: number;   // Blur radius for smoothing
  normalizationMode?: 'statistics' | 'logarithmic'; // Normalization method
}

export interface RGBFloat {
  r: number;
  g: number;
  b: number;
}

export interface Statistics {
  min: RGBFloat;
  max: RGBFloat;
  mean: RGBFloat;
  stdev: RGBFloat;
}

export interface RenderResult {
  imagePath: string;
  statistics: Statistics;
  pointCount: number;
  renderTime: number;
}

export interface BrowserRenderResult {
  imageData: string; // Base64 PNG data URL
  statistics: Statistics;
  pointCount: number;
  renderTime: number;
}

// ============================================================================
// SIMPLE PNG RENDERER
// ============================================================================

export class SimplePNGRenderer {
  private config: ImageConfig;
  private grid!: RGBFloat[][];

  constructor(config: Partial<ImageConfig> = {}) {
    this.config = {
      width: config.width || 800,
      height: config.height || 600,
      scale: config.scale || 100.0,
      offsetX: config.offsetX || 400,
      offsetY: config.offsetY || 300,
      blurRadius: config.blurRadius || 2.0,
      ...config
    };

    this.initializeGrid();
  }

  /**
   * Render points to PNG file
   */
  async renderPointsToPNG(
    points: Point2D[],
    outputPath: string
  ): Promise<RenderResult> {
    const startTime = Date.now();

    console.log(`Rendering ${points.length} points to ${outputPath}`);

    // Step 1: Aggregate points into 2D float RGB grid
    this.aggregatePoints(points);

    // Step 2: Apply blur for smoothing
    this.applyBlur();

    // Step 3: Calculate statistics
    const statistics = this.calculateStatistics();

    // Step 4: Transform to 256 RGB values and generate PNG
    const pngBuffer = this.generatePNGBuffer(statistics);

    // Step 5: Write PNG file
    await this.writePNGFile(pngBuffer, outputPath);

    const renderTime = Date.now() - startTime;

    console.log(`Rendered ${points.length} points in ${renderTime}ms`);
    console.log(`Statistics:`, statistics);

    return {
      imagePath: outputPath,
      statistics,
      pointCount: points.length,
      renderTime
    };
  }

  /**
   * Render multiple batches for animation frames
   */
  async renderAnimationFrames(
    batches: Point2D[][],
    outputDir: string,
    baseName: string = 'frame'
  ): Promise<RenderResult[]> {
    const results: RenderResult[] = [];

    for (let i = 0; i < batches.length; i++) {
      const outputPath = `${outputDir}/${baseName}_${i.toString().padStart(3, '0')}.png`;
      const result = await this.renderPointsToPNG(batches[i], outputPath);
      results.push(result);
    }

    return results;
  }

  /**
   * Render points to PNG data URL for browser usage
   */
  async renderPointsToDataURL(points: Point2D[]): Promise<BrowserRenderResult> {
    const startTime = Date.now();

    console.log(`Rendering ${points.length} points to data URL`);

    // Step 1: Aggregate points into 2D float RGB grid
    this.aggregatePoints(points);

    // Step 2: Apply blur for smoothing
    this.applyBlur();

    // Step 3: Calculate statistics
    const statistics = this.calculateStatistics();

    // Step 4: Transform to 256 RGB values and generate PNG
    const pngBuffer = this.generatePNGBuffer(statistics);

    // Step 5: Convert to data URL
    const imageData = this.bufferToDataURL(pngBuffer);

    const renderTime = Date.now() - startTime;

    console.log(`Rendered ${points.length} points in ${renderTime}ms`);
    console.log(`Statistics:`, statistics);

    return {
      imageData,
      statistics,
      pointCount: points.length,
      renderTime
    };
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  /**
   * Initialize the 2D float RGB grid
   */
  private initializeGrid(): void {
    this.grid = [];
    for (let y = 0; y < this.config.height; y++) {
      this.grid[y] = [];
      for (let x = 0; x < this.config.width; x++) {
        this.grid[y][x] = { r: 0, g: 0, b: 0 };
      }
    }
  }

  /**
   * Aggregate points into the 2D grid
   */
  private aggregatePoints(points: Point2D[]): void {
    // Reset grid
    this.initializeGrid();

    for (const point of points) {
      // Convert world coordinates to grid coordinates
      const gridX = Math.round(point.x * this.config.scale + this.config.offsetX);
      const gridY = Math.round(point.y * this.config.scale + this.config.offsetY);

      // Check bounds
      if (gridX >= 0 && gridX < this.config.width && 
          gridY >= 0 && gridY < this.config.height) {
        
        // Parse color from HSL string or use default
        const rgb = this.parseColor(point.color || 'hsl(200, 70%, 50%)');
        
        // Add to grid (accumulate values)
        this.grid[gridY][gridX].r += rgb.r;
        this.grid[gridY][gridX].g += rgb.g;
        this.grid[gridY][gridX].b += rgb.b;
      }
    }
  }

  /**
   * Apply blur for smoothing
   */
  private applyBlur(): void {
    if (this.config.blurRadius <= 0) return;

    const newGrid: RGBFloat[][] = [];
    for (let y = 0; y < this.config.height; y++) {
      newGrid[y] = [];
      for (let x = 0; x < this.config.width; x++) {
        newGrid[y][x] = { r: 0, g: 0, b: 0 };
      }
    }

    const radius = Math.floor(this.config.blurRadius);
    const totalWeight = (2 * radius + 1) * (2 * radius + 1);

    for (let y = 0; y < this.config.height; y++) {
      for (let x = 0; x < this.config.width; x++) {
        let r = 0, g = 0, b = 0;

        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const ny = y + dy;
            const nx = x + dx;

            if (ny >= 0 && ny < this.config.height && 
                nx >= 0 && nx < this.config.width) {
              r += this.grid[ny][nx].r;
              g += this.grid[ny][nx].g;
              b += this.grid[ny][nx].b;
            }
          }
        }

        newGrid[y][x] = {
          r: r / totalWeight,
          g: g / totalWeight,
          b: b / totalWeight
        };
      }
    }

    this.grid = newGrid;
  }

  /**
   * Calculate statistics for the grid
   */
  private calculateStatistics(): Statistics {
    let minR = Infinity, minG = Infinity, minB = Infinity;
    let maxR = -Infinity, maxG = -Infinity, maxB = -Infinity;
    let sumR = 0, sumG = 0, sumB = 0;
    let count = 0;

    // First pass: find min, max, and mean
    for (let y = 0; y < this.config.height; y++) {
      for (let x = 0; x < this.config.width; x++) {
        const pixel = this.grid[y][x];
        if (pixel.r > 0 || pixel.g > 0 || pixel.b > 0) {
          minR = Math.min(minR, pixel.r);
          minG = Math.min(minG, pixel.g);
          minB = Math.min(minB, pixel.b);
          
          maxR = Math.max(maxR, pixel.r);
          maxG = Math.max(maxG, pixel.g);
          maxB = Math.max(maxB, pixel.b);
          
          sumR += pixel.r;
          sumG += pixel.g;
          sumB += pixel.b;
          count++;
        }
      }
    }

    if (count === 0) {
      return {
        min: { r: 0, g: 0, b: 0 },
        max: { r: 0, g: 0, b: 0 },
        mean: { r: 0, g: 0, b: 0 },
        stdev: { r: 0, g: 0, b: 0 }
      };
    }

    const meanR = sumR / count;
    const meanG = sumG / count;
    const meanB = sumB / count;

    // Second pass: calculate standard deviation
    let sumVarR = 0, sumVarG = 0, sumVarB = 0;
    for (let y = 0; y < this.config.height; y++) {
      for (let x = 0; x < this.config.width; x++) {
        const pixel = this.grid[y][x];
        if (pixel.r > 0 || pixel.g > 0 || pixel.b > 0) {
          sumVarR += (pixel.r - meanR) * (pixel.r - meanR);
          sumVarG += (pixel.g - meanG) * (pixel.g - meanG);
          sumVarB += (pixel.b - meanB) * (pixel.b - meanB);
        }
      }
    }

    return {
      min: { r: minR, g: minG, b: minB },
      max: { r: maxR, g: maxG, b: maxB },
      mean: { r: meanR, g: meanG, b: meanB },
      stdev: {
        r: Math.sqrt(sumVarR / count),
        g: Math.sqrt(sumVarG / count),
        b: Math.sqrt(sumVarB / count)
      }
    };
  }

  /**
   * Generate PNG buffer from grid data
   */
  private generatePNGBuffer(statistics: Statistics): Buffer | Uint8Array {
    const { width, height } = this.config;
    
    // Use Uint8Array for browser compatibility, Buffer for Node.js
    const buffer = typeof Buffer !== 'undefined' 
      ? Buffer.alloc(width * height * 3) 
      : new Uint8Array(width * height * 3);
    
    let offset = 0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixel = this.grid[y][x];
        
        // Choose normalization method based on configuration
        const normalizationMode = this.config.normalizationMode || 'logarithmic'; // Default to new method
        
        let r, g, b;
        if (normalizationMode === 'logarithmic') {
          // Use advanced logarithmic + sigmoid normalization (FIXED - consistent across point counts)
          r = this.normalizeFixedLogarithmic(pixel.r);
          g = this.normalizeFixedLogarithmic(pixel.g);
          b = this.normalizeFixedLogarithmic(pixel.b);
        } else {
          // Use legacy statistics-based normalization
          r = this.normalizeValue(pixel.r, statistics.min.r, statistics.max.r);
          g = this.normalizeValue(pixel.g, statistics.min.g, statistics.max.g);
          b = this.normalizeValue(pixel.b, statistics.min.b, statistics.max.b);
        }

        buffer[offset++] = Math.round(r);
        buffer[offset++] = Math.round(g);
        buffer[offset++] = Math.round(b);
      }
    }

    return buffer;
  }

  /**
   * Normalize value to 0-255 range (legacy statistics-based method)
   */
  private normalizeValue(value: number, min: number, max: number): number {
    if (max === min) return 0;
    return ((value - min) / (max - min)) * 255;
  }

  /**
   * Advanced logarithmic + sigmoid normalization (FIXED - not data-dependent)
   * This method provides consistent visual results regardless of point count
   */
  private normalizeFixedLogarithmic(value: number): number {
    // Step 1: Logarithmic transformation to handle wide dynamic range
    const logValue = Math.log(Math.abs(value) * 255 + 1);
    
    // Step 2: Fixed middle point (based on typical attractor data analysis)
    const fixedMiddle = 4.5;
    
    // Step 3: Calculate error from fixed middle point
    const error = logValue - fixedMiddle;
    
    // Step 4: Fixed normalization factor (based on typical standard deviation)
    const fixedStdev = 1.0;
    const normalizedError = error / fixedStdev;
    
    // Step 5: Apply sigmoid function for smooth, bounded transformation
    const sigmoidOutput = 1 / (1 + Math.exp(-normalizedError));
    
    // Step 6: Map to 8-bit RGB (0-255)
    return Math.round(sigmoidOutput * 255);
  }

  /**
   * Parse color string to RGB
   */
  private parseColor(colorStr: string): RGBFloat {
    // Simple HSL to RGB conversion for common cases
    if (colorStr.startsWith('hsl(')) {
      const match = colorStr.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
      if (match) {
        const h = parseInt(match[1]) / 360;
        const s = parseInt(match[2]) / 100;
        const l = parseInt(match[3]) / 100;
        
        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs((h * 6) % 2 - 1));
        const m = l - c / 2;
        
        let r = 0, g = 0, b = 0;
        if (h < 1/6) { r = c; g = x; b = 0; }
        else if (h < 2/6) { r = x; g = c; b = 0; }
        else if (h < 3/6) { r = 0; g = c; b = x; }
        else if (h < 4/6) { r = 0; g = x; b = c; }
        else if (h < 5/6) { r = x; g = 0; b = c; }
        else { r = c; g = 0; b = x; }
        
        return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 };
      }
    }
    
    // Default blue color
    return { r: 100, g: 150, b: 255 };
  }

  /**
   * Write PNG file using Node.js fs
   */
  private async writePNGFile(buffer: Buffer | Uint8Array, outputPath: string): Promise<void> {
    const fs = require('fs').promises;
    const path = require('path');
    
    // Ensure output directory exists
    const dir = path.dirname(outputPath);
    await fs.mkdir(dir, { recursive: true });
    
    // Generate proper PNG file with headers
    const pngBuffer = this.createPNGFile(buffer);
    await fs.writeFile(outputPath, pngBuffer);
    
    console.log(`PNG image written to: ${outputPath}`);
  }

  /**
   * Create proper PNG file with headers and compression
   */
  private createPNGFile(rgbData: Buffer | Uint8Array): Buffer | Uint8Array {
    const { width, height } = this.config;
    
    // PNG file signature
    const signature = typeof Buffer !== 'undefined' 
      ? Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])
      : new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
    
    // IHDR chunk
    const ihdrData = typeof Buffer !== 'undefined' ? Buffer.alloc(13) : new Uint8Array(13);
    this.writeUInt32BE(ihdrData, width, 0);    // Width
    this.writeUInt32BE(ihdrData, height, 4);   // Height
    ihdrData[8] = 8;           // Bit depth
    ihdrData[9] = 2;           // Color type (RGB)
    ihdrData[10] = 0;          // Compression method
    ihdrData[11] = 0;          // Filter method
    ihdrData[12] = 0;          // Interlace method
    
    const ihdrChunk = this.createPNGChunk('IHDR', ihdrData);
    
    // Convert RGB data to PNG format (add filter bytes)
    const filteredData = this.addPNGFilters(rgbData);
    
    // Compress the image data (simple compression for now)
    const compressedData = this.compressData(filteredData);
    const idatChunk = this.createPNGChunk('IDAT', compressedData);
    
    // IEND chunk
    const emptyData = typeof Buffer !== 'undefined' ? Buffer.alloc(0) : new Uint8Array(0);
    const iendChunk = this.createPNGChunk('IEND', emptyData);
    
    // Combine all chunks
    return this.concatBuffers([signature, ihdrChunk, idatChunk, iendChunk]);
  }

  /**
   * Convert buffer to data URL for browser usage
   */
  private bufferToDataURL(rgbData: Buffer | Uint8Array): string {
    const pngData = this.createPNGFile(rgbData);
    
    // Convert to base64
    let base64: string;
    if (typeof Buffer !== 'undefined') {
      base64 = (pngData as Buffer).toString('base64');
    } else {
      // Browser fallback - convert Uint8Array to base64
      const bytes = new Uint8Array(pngData as Uint8Array);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      base64 = btoa(binary);
    }
    
    return `data:image/png;base64,${base64}`;
  }

  /**
   * Create PNG chunk with CRC
   */
  private createPNGChunk(type: string, data: Buffer | Uint8Array): Buffer | Uint8Array {
    const typeBuffer = typeof Buffer !== 'undefined' 
      ? Buffer.from(type, 'ascii') 
      : new Uint8Array(Array.from(type, c => c.charCodeAt(0)));
    
    const length = typeof Buffer !== 'undefined' ? Buffer.alloc(4) : new Uint8Array(4);
    this.writeUInt32BE(length, data.length, 0);
    
    const combined = this.concatBuffers([typeBuffer, data]);
    const crc = this.calculateCRC(combined);
    const crcBuffer = typeof Buffer !== 'undefined' ? Buffer.alloc(4) : new Uint8Array(4);
    this.writeUInt32BE(crcBuffer, crc, 0);
    
    return this.concatBuffers([length, typeBuffer, data, crcBuffer]);
  }

  /**
   * Add PNG filter bytes to RGB data
   */
  private addPNGFilters(rgbData: Buffer | Uint8Array): Buffer | Uint8Array {
    const { width } = this.config;
    const bytesPerRow = width * 3;
    const filteredData = typeof Buffer !== 'undefined' 
      ? Buffer.alloc(rgbData.length + this.config.height)
      : new Uint8Array(rgbData.length + this.config.height);
    
    let inputOffset = 0;
    let outputOffset = 0;
    
    for (let row = 0; row < this.config.height; row++) {
      // Add filter type (0 = None)
      filteredData[outputOffset++] = 0;
      
      // Copy row data
      for (let i = 0; i < bytesPerRow; i++) {
        filteredData[outputOffset++] = rgbData[inputOffset++];
      }
    }
    
    return filteredData;
  }

  /**
   * Compress data using zlib (deflate) - Node.js only
   */
  private compressData(data: Buffer | Uint8Array): Buffer | Uint8Array {
    if (typeof Buffer !== 'undefined') {
      const zlib = require('zlib');
      return zlib.deflateSync(data);
    } else {
      // Browser fallback - simple compression (not ideal but functional)
      return data; // For now, return uncompressed data
    }
  }

  /**
   * Calculate CRC32 for PNG chunks
   */
  private calculateCRC(data: Buffer | Uint8Array): number {
    const crcTable = this.generateCRCTable();
    let crc = 0xFFFFFFFF;
    
    for (let i = 0; i < data.length; i++) {
      crc = crcTable[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
    }
    
    // Ensure result is unsigned 32-bit integer
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }

  /**
   * Generate CRC32 table
   */
  private generateCRCTable(): number[] {
    const table = new Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) {
        c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      }
      table[i] = c;
    }
    return table;
  }

  /**
   * Write 32-bit big-endian integer to buffer
   */
  private writeUInt32BE(buffer: Buffer | Uint8Array, value: number, offset: number): void {
    if (typeof Buffer !== 'undefined') {
      (buffer as Buffer).writeUInt32BE(value, offset);
    } else {
      const uint8Array = buffer as Uint8Array;
      uint8Array[offset] = (value >>> 24) & 0xFF;
      uint8Array[offset + 1] = (value >>> 16) & 0xFF;
      uint8Array[offset + 2] = (value >>> 8) & 0xFF;
      uint8Array[offset + 3] = value & 0xFF;
    }
  }

  /**
   * Concatenate multiple buffers
   */
  private concatBuffers(buffers: (Buffer | Uint8Array)[]): Buffer | Uint8Array {
    if (typeof Buffer !== 'undefined') {
      return Buffer.concat(buffers as Buffer[]);
    } else {
      const totalLength = buffers.reduce((sum, buf) => sum + buf.length, 0);
      const result = new Uint8Array(totalLength);
      let offset = 0;
      for (const buf of buffers) {
        result.set(buf as Uint8Array, offset);
        offset += buf.length;
      }
      return result;
    }
  }
}
