#!/usr/bin/env node

/**
 * Debug Color Scheme Script
 * 
 * This script generates points and inspects the color function in detail
 * to understand why we're not seeing blue vs magenta colors.
 */

const path = require('path');
const fs = require('fs');

// Import the attractor engine and image renderer
const { JavaScriptAttractorEngine } = require('../dist/typescript/core/js-engine');
const { createQuaternion, createVector3D, SideFlipMode, ProjectionType } = require('../dist/typescript/core/attractor-engine');
const { SimplePNGRenderer } = require('../dist/typescript/node/image-renderer');

class ColorSchemeDebugger {
  constructor() {
    this.engine = new JavaScriptAttractorEngine();
    this.renderer = new SimplePNGRenderer();
  }

  /**
   * Test color function with various side and index values
   */
  testColorFunction() {
    console.log('🎨 Testing Color Function');
    console.log('========================');

    // Test different side and index combinations
    const testCases = [
      { side: 1, index: 0, description: 'Side +1, Index 0' },
      { side: -1, index: 0, description: 'Side -1, Index 0' },
      { side: 1, index: 100, description: 'Side +1, Index 100' },
      { side: -1, index: 100, description: 'Side -1, Index 100' },
      { side: 1, index: 1000, description: 'Side +1, Index 1000' },
      { side: -1, index: 1000, description: 'Side -1, Index 1000' },
    ];

    testCases.forEach((testCase, i) => {
      console.log(`\n📊 Test Case ${i + 1}: ${testCase.description}`);
      
      // Simulate the color function logic
      const baseHsl = { hue: 200, saturation: 70, lightness: 50 }; // Default blue
      
      let hue = baseHsl.hue;
      let saturation = baseHsl.saturation;
      let lightness = baseHsl.lightness;
      
      // Apply side-based coloring
      if (testCase.side !== undefined) {
        hue = testCase.side > 0 ? 200 : 320; // Blue vs Magenta
      }
      
      // Apply temporal gradient
      if (testCase.index !== undefined) {
        const indexVariation = Math.sin(testCase.index * 0.1) * 10;
        hue = (hue + indexVariation + 360) % 360;
      }
      
      console.log(`  Input: side=${testCase.side}, index=${testCase.index}`);
      console.log(`  Base HSL: ${baseHsl.hue}°, ${baseHsl.saturation}%, ${baseHsl.lightness}%`);
      console.log(`  Final HSL: ${hue.toFixed(1)}°, ${saturation}%, ${lightness}%`);
      
      // Convert to RGB for display
      const rgb = this.hslToRgb(hue, saturation, lightness);
      console.log(`  RGB: (${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)})`);
      
      // Color name approximation
      const colorName = this.getColorName(hue);
      console.log(`  Color: ${colorName}`);
    });
  }

  /**
   * HSL to RGB conversion
   */
  hslToRgb(h, s, l) {
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
    
    return {
      r: (r + m) * 255,
      g: (g + m) * 255,
      b: (b + m) * 255
    };
  }

  /**
   * Get approximate color name from hue
   */
  getColorName(hue) {
    if (hue >= 0 && hue < 30) return 'Red';
    if (hue >= 30 && hue < 60) return 'Orange';
    if (hue >= 60 && hue < 90) return 'Yellow';
    if (hue >= 90 && hue < 150) return 'Green';
    if (hue >= 150 && hue < 210) return 'Cyan';
    if (hue >= 210 && hue < 270) return 'Blue';
    if (hue >= 270 && hue < 330) return 'Purple/Magenta';
    if (hue >= 330 && hue < 360) return 'Pink';
    return 'Unknown';
  }

  /**
   * Generate a small batch of points and inspect their properties
   */
  async debugPointGeneration() {
    console.log('\n🎯 Debugging Point Generation');
    console.log('==============================');

    // Create test parameters with negative wind w to ensure mixed sides
    const constants = {
      start: createQuaternion(0.5, 0.3, 0.2, 0.1),
      wind: createQuaternion(-0.8, 0.1, 0.05, 0.02), // Negative w wind to flip sides
      additive: createVector3D(0.1, 0.05, 0.02),
      mode: SideFlipMode.PLAIN_FLIP
    };

    const renderParams = {
      batchSize: 50, // Small batch for debugging
      imageSize: 800,
      projectionType: ProjectionType.SIMPLE,
      cameraRotation: createQuaternion(1, 0, 0, 0) // Identity quaternion
    };

    console.log('📋 Test Parameters:');
    console.log(`  Batch Size: ${renderParams.batchSize}`);
    console.log(`  Mode: ${SideFlipMode[constants.mode]}`);
    console.log(`  Start: (${constants.start.w.toFixed(3)}, ${constants.start.x.toFixed(3)}, ${constants.start.y.toFixed(3)}, ${constants.start.z.toFixed(3)})`);
    console.log(`  Wind: (${constants.wind.w.toFixed(3)}, ${constants.wind.x.toFixed(3)}, ${constants.wind.y.toFixed(3)}, ${constants.wind.z.toFixed(3)})`);
    console.log(`  Additive: (${constants.additive.x.toFixed(3)}, ${constants.additive.y.toFixed(3)}, ${constants.additive.z.toFixed(3)})`);

    // Generate points
    console.log('\n🎲 Generating Points...');
    const result = this.engine.generateBatch(constants, renderParams);
    
    console.log(`✅ Generated ${result.points.length} points`);

    // Analyze the points
    console.log('\n📊 Point Analysis:');
    console.log('==================');

    let sideDistribution = { positive: 0, negative: 0, undefined: 0 };
    let colorDistribution = { blue: 0, magenta: 0, other: 0 };
    let indexRange = { min: Infinity, max: -Infinity };

    result.points.forEach((point, i) => {
      // Check side distribution
      if (point.side === 1) sideDistribution.positive++;
      else if (point.side === -1) sideDistribution.negative++;
      else sideDistribution.undefined++;

      // Check index range
      if (point.index !== undefined) {
        indexRange.min = Math.min(indexRange.min, point.index);
        indexRange.max = Math.max(indexRange.max, point.index);
      }

      // Simulate color calculation
      const baseHsl = { hue: 200, saturation: 70, lightness: 50 };
      let hue = baseHsl.hue;
      
      if (point.side !== undefined) {
        hue = point.side > 0 ? 200 : 320; // Blue vs Magenta
      }
      
      if (point.index !== undefined) {
        const indexVariation = Math.sin(point.index * 0.1) * 10;
        hue = (hue + indexVariation + 360) % 360;
      }

      // Categorize color
      if (hue >= 180 && hue < 270) colorDistribution.blue++;
      else if (hue >= 270 && hue < 330) colorDistribution.magenta++;
      else colorDistribution.other++;

      // Show details for first 10 points
      if (i < 10) {
        const rgb = this.hslToRgb(hue, 70, 50);
        const colorName = this.getColorName(hue);
        console.log(`  Point ${i}: side=${point.side}, index=${point.index}, hue=${hue.toFixed(1)}°, color=${colorName}, rgb=(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)})`);
      }
    });

    console.log('\n📈 Distribution Summary:');
    console.log(`  Side Distribution: +1=${sideDistribution.positive}, -1=${sideDistribution.negative}, undefined=${sideDistribution.undefined}`);
    console.log(`  Index Range: ${indexRange.min} to ${indexRange.max}`);
    console.log(`  Color Distribution: Blue=${colorDistribution.blue}, Magenta=${colorDistribution.magenta}, Other=${colorDistribution.other}`);

    // Check if we have the expected hemisphere split
    const totalWithSide = sideDistribution.positive + sideDistribution.negative;
    if (totalWithSide > 0) {
      const positivePercent = (sideDistribution.positive / totalWithSide) * 100;
      const negativePercent = (sideDistribution.negative / totalWithSide) * 100;
      console.log(`  Side Percentages: +1=${positivePercent.toFixed(1)}%, -1=${negativePercent.toFixed(1)}%`);
      
      if (positivePercent > 90 || negativePercent > 90) {
        console.log('  ⚠️  WARNING: Highly skewed side distribution! This explains why we only see one color.');
      } else if (Math.abs(positivePercent - negativePercent) < 10) {
        console.log('  ✅ Good side distribution - should show both blue and magenta colors.');
      }
    }

    return {
      points: result.points,
      sideDistribution,
      colorDistribution,
      indexRange
    };
  }

  /**
   * Generate a test image to visually verify colors
   */
  async generateTestImage(debugData) {
    console.log('\n🖼️  Generating Test Image');
    console.log('=========================');

    const outputPath = path.join(__dirname, '..', 'output', 'debug_color_test.png');
    
    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    try {
      const result = await this.renderer.renderPointsToDataURL(debugData.points);
      
      // Save the image
      const base64Data = result.dataURL.replace(/^data:image\/png;base64,/, '');
      fs.writeFileSync(outputPath, base64Data, 'base64');
      
      console.log(`✅ Test image saved to: ${outputPath}`);
      console.log(`📊 Image contains ${debugData.points.length} points`);
      console.log(`🎨 Expected colors: ${debugData.colorDistribution.blue} blue, ${debugData.colorDistribution.magenta} magenta`);
      
      return outputPath;
    } catch (error) {
      console.error('❌ Error generating test image:', error.message);
      return null;
    }
  }
}

/**
 * Main execution function
 */
async function main() {
  const colorDebugger = new ColorSchemeDebugger();
  
  try {
    // Test the color function with various inputs
    colorDebugger.testColorFunction();
    
    // Generate points and analyze them
    const debugData = await colorDebugger.debugPointGeneration();
    
    // Generate a test image
    const imagePath = await colorDebugger.generateTestImage(debugData);
    
    console.log('\n🎯 DEBUG COMPLETE');
    console.log('=================');
    console.log('Check the analysis above to identify the issue with the color scheme.');
    if (imagePath) {
      console.log(`Visual test image: ${imagePath}`);
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { ColorSchemeDebugger };
