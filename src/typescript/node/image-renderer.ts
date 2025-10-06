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
}

export interface RGBFloat {
  r: number;
  g: number;
  b: number;
  // Precomputed logarithmic values for efficiency
  logR: number;
  logG: number;
  logB: number;
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
        this.grid[y][x] = { r: 0, g: 0, b: 0, logR: 0, logG: 0, logB: 0 };
      }
    }
  }

  /**
   * Aggregate points into the 2D grid
   */
  private aggregatePoints(points: Point2D[]): void {
    // Reset grid
    this.initializeGrid();

    // Parse the default color string only once
    const defaultColorStr = 'hsl(200, 70%, 50%)';
    const baseHsl = this.parseColorString(defaultColorStr);

    for (const point of points) {
      // Apply side and index variations (fast operation per point)
      const rgb = this.applyColorVariations(baseHsl, point.side, point.index);
      
      // Convert world coordinates to grid coordinates
      const gridX = Math.round(point.x * this.config.scale + this.config.offsetX);
      const gridY = Math.round(point.y * this.config.scale + this.config.offsetY);

      // Check bounds
      if (gridX >= 0 && gridX < this.config.width && 
          gridY >= 0 && gridY < this.config.height) {
        
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
    if (this.config.blurRadius <= 0) {
      // Even without blur, compute log values
      this.computeLogValues();
      return;
    }

    const newGrid: RGBFloat[][] = [];
    for (let y = 0; y < this.config.height; y++) {
      newGrid[y] = [];
      for (let x = 0; x < this.config.width; x++) {
        newGrid[y][x] = { r: 0, g: 0, b: 0, logR: 0, logG: 0, logB: 0 };
      }
    }

    // Probabilistic blur implementation
    const samplesPerPixel = 16; // Number of random samples per pixel
    const radius = 0.75; // Fixed blur radius for optimal quality

    for (let y = 0; y < this.config.height; y++) {
      for (let x = 0; x < this.config.width; x++) {
        let r = 0, g = 0, b = 0;
        let validSamples = 0;

        for (let sample = 0; sample < samplesPerPixel; sample++) {
          // Generate random x, y between -1 and 1
          const randomX = (Math.random() - 0.5) * 2; // Range: [-1, 1]
          const randomY = (Math.random() - 0.5) * 2; // Range: [-1, 1]
          
          // Compute distance from center
          const distance = Math.sqrt(randomX * randomX + randomY * randomY);
          
          // Discard if distance > 0.9999999 (outside unit circle)
          if (distance > 0.9999999) continue;
          
          // Normalize x and y by distance
          const normalizedX = randomX / distance;
          const normalizedY = randomY / distance;
          
          // Compute atanh(distance) * radius
          const atanhDistance = Math.atanh(distance) * radius;
          
          // Multiply by this factor to get final offset
          const offsetX = normalizedX * atanhDistance;
          const offsetY = normalizedY * atanhDistance;
          
          // Calculate sample position
          const sampleX = Math.round(x + offsetX);
          const sampleY = Math.round(y + offsetY);
          
          // Check bounds
          if (sampleY >= 0 && sampleY < this.config.height && 
              sampleX >= 0 && sampleX < this.config.width) {
            r += this.grid[sampleY][sampleX].r;
            g += this.grid[sampleY][sampleX].g;
            b += this.grid[sampleY][sampleX].b;
            validSamples++;
          }
        }

        const blurredR = validSamples > 0 ? r / validSamples : 0;
        const blurredG = validSamples > 0 ? g / validSamples : 0;
        const blurredB = validSamples > 0 ? b / validSamples : 0;

        newGrid[y][x] = {
          r: blurredR,
          g: blurredG,
          b: blurredB,
          logR: Math.log(blurredR + 1),
          logG: Math.log(blurredG + 1),
          logB: Math.log(blurredB + 1)
        };
      }
    }

    this.grid = newGrid;
  }

  /**
   * Compute logarithmic values for all pixels (used when no blur is applied)
   */
  private computeLogValues(): void {
    for (let y = 0; y < this.config.height; y++) {
      for (let x = 0; x < this.config.width; x++) {
        const pixel = this.grid[y][x];
        this.grid[y][x] = {
          ...pixel,
          logR: Math.log(pixel.r + 1),
          logG: Math.log(pixel.g + 1),
          logB: Math.log(pixel.b + 1)
        };
      }
    }
  }

  /**
   * Calculate statistics for the grid
   */
  private calculateStatistics(): Statistics {
    // Use logarithmic statistics with precomputed log values
    let minLogR = 0, minLogG = 0, minLogB = 0;
    let maxLogR = 0, maxLogG = 0, maxLogB = 0;
    let sumLogR = 0, sumLogG = 0, sumLogB = 0;
    let count = 0;

    // First pass: find min, max, and mean using log values
    let firstPixel = true;
    for (let y = 0; y < this.config.height; y++) {
      for (let x = 0; x < this.config.width; x++) {
        const pixel = this.grid[y][x];
        // Use precomputed log values for statistics
        if (pixel.r > 0 || pixel.g > 0 || pixel.b > 0) {
          if (firstPixel) {
            minLogR = pixel.logR;
            minLogG = pixel.logG;
            minLogB = pixel.logB;
            maxLogR = pixel.logR;
            maxLogG = pixel.logG;
            maxLogB = pixel.logB;
            firstPixel = false;
          } else {
            minLogR = Math.min(minLogR, pixel.logR);
            minLogG = Math.min(minLogG, pixel.logG);
            minLogB = Math.min(minLogB, pixel.logB);
            
            maxLogR = Math.max(maxLogR, pixel.logR);
            maxLogG = Math.max(maxLogG, pixel.logG);
            maxLogB = Math.max(maxLogB, pixel.logB);
          }
          
          sumLogR += pixel.logR;
          sumLogG += pixel.logG;
          sumLogB += pixel.logB;
          count++;
        }
      }
    }

    if (count === 0) {
      return {
        min: { r: 0, g: 0, b: 0, logR: 0, logG: 0, logB: 0 },
        max: { r: 0, g: 0, b: 0, logR: 0, logG: 0, logB: 0 },
        mean: { r: 0, g: 0, b: 0, logR: 0, logG: 0, logB: 0 },
        stdev: { r: 0, g: 0, b: 0, logR: 0, logG: 0, logB: 0 }
      };
    }

    const meanLogR = sumLogR / count;
    const meanLogG = sumLogG / count;
    const meanLogB = sumLogB / count;

    // Second pass: calculate standard deviation using log values
    let sumVarLogR = 0, sumVarLogG = 0, sumVarLogB = 0;
    for (let y = 0; y < this.config.height; y++) {
      for (let x = 0; x < this.config.width; x++) {
        const pixel = this.grid[y][x];
        if (pixel.r > 0 || pixel.g > 0 || pixel.b > 0) {
          sumVarLogR += (pixel.logR - meanLogR) * (pixel.logR - meanLogR);
          sumVarLogG += (pixel.logG - meanLogG) * (pixel.logG - meanLogG);
          sumVarLogB += (pixel.logB - meanLogB) * (pixel.logB - meanLogB);
        }
      }
    }

    return {
      min: { r: minLogR, g: minLogG, b: minLogB, logR: minLogR, logG: minLogG, logB: minLogB },
      max: { r: maxLogR, g: maxLogG, b: maxLogB, logR: maxLogR, logG: maxLogG, logB: maxLogB },
      mean: { r: meanLogR, g: meanLogG, b: meanLogB, logR: meanLogR, logG: meanLogG, logB: meanLogB },
      stdev: {
        r: Math.sqrt(sumVarLogR / count),
        g: Math.sqrt(sumVarLogG / count),
        b: Math.sqrt(sumVarLogB / count),
        logR: Math.sqrt(sumVarLogR / count),
        logG: Math.sqrt(sumVarLogG / count),
        logB: Math.sqrt(sumVarLogB / count)
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
        
        // Use precomputed log values with statistics-based normalization
        const r = this.normalizeFromLogValues(pixel.logR, statistics);
        const g = this.normalizeFromLogValues(pixel.logG, statistics);
        const b = this.normalizeFromLogValues(pixel.logB, statistics);

        buffer[offset++] = Math.round(r);
        buffer[offset++] = Math.round(g);
        buffer[offset++] = Math.round(b);
      }
    }

    return buffer;
  }


  /**
   * Normalize precomputed log values using actual statistics
   * This provides mathematically sound normalization based on real data
   */
  private normalizeFromLogValues(logValue: number, statistics: Statistics): number {
    // Use actual mean and standard deviation from log-transformed data
    const mean = (statistics.mean.logR + statistics.mean.logG + statistics.mean.logB) / 3;
    const stdev = (statistics.stdev.logR + statistics.stdev.logG + statistics.stdev.logB) / 3;
    
    // Calculate normalized value (standardized to mean=0, stdev=1)
    const normalizedValue = (logValue - mean) / stdev;
    
    // Apply sigmoid function for smooth, bounded transformation
    const sigmoidOutput = 1 / (1 + Math.exp(-normalizedValue));
    
    // Map to 8-bit RGB (0-255)
    return sigmoidOutput * 255;
  }


  /**
   * Parse color string to extract HSL components (called once per unique color string)
   * @param colorStr Color string (HSL format)
   * @returns Parsed HSL components
   */
  private parseColorString(colorStr: string): { hue: number; saturation: number; lightness: number } {
    let hue = 200; // Default blue
    let saturation = 70;
    let lightness = 50;
    
    // Parse existing HSL format if present
    if (colorStr.startsWith('hsl(')) {
      const match = colorStr.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
      if (match) {
        hue = parseInt(match[1]);
        saturation = parseInt(match[2]);
        lightness = parseInt(match[3]);
      }
    }
    
    return { hue, saturation, lightness };
  }

  /**
   * Apply side and index variations to HSL components and convert to RGB
   * @param baseHsl Base HSL components from parseColorString
   * @param side Hemisphere information (+1 or -1)
   * @param index Point generation index for temporal gradient
   * @returns RGB color with precomputed logarithmic values
   */
  private applyColorVariations(baseHsl: { hue: number; saturation: number; lightness: number }, side?: number, index?: number): RGBFloat {
    let hue = baseHsl.hue;
    let saturation = baseHsl.saturation;
    let lightness = baseHsl.lightness;
    
    // Extract side information for blue vs magenta distinction
    if (side !== undefined) {
      hue = side > 0 ? 200 : 320; // Blue vs Magenta
    }
    
    // Apply temporal gradient if index is available
    if (index !== undefined) {
      const indexVariation = Math.sin(index * 0.1) * 10; // ±10° variation
      hue = (hue + indexVariation + 360) % 360;
    }
    
    return this.hslToRgb(hue, saturation, lightness);
  }

  /**
   * Convert HSL to RGB with precomputed logarithmic values
   */
  private hslToRgb(h: number, s: number, l: number): RGBFloat {
    const hNorm = h / 360;
    const sNorm = s / 100;
    const lNorm = l / 100;
    
    const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
    const x = c * (1 - Math.abs((hNorm * 6) % 2 - 1));
    const m = lNorm - c / 2;
    
    let r = 0, g = 0, b = 0;
    if (hNorm < 1/6) { r = c; g = x; b = 0; }
    else if (hNorm < 2/6) { r = x; g = c; b = 0; }
    else if (hNorm < 3/6) { r = 0; g = c; b = x; }
    else if (hNorm < 4/6) { r = 0; g = x; b = c; }
    else if (hNorm < 5/6) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }
    
    const rgb = { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 };
    return {
      ...rgb,
      logR: Math.log(rgb.r + 1),
      logG: Math.log(rgb.g + 1),
      logB: Math.log(rgb.b + 1)
    };
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
