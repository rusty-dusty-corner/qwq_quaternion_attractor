#!/usr/bin/env node

/**
 * Results Organizer for Quaternion Attractor
 * 
 * This tool organizes all generated results into a structured format for:
 * 1. Easy comparison of images
 * 2. Reuse of good parameters
 * 3. Tracking analysis results
 * 4. Future generation planning
 */

const fs = require('fs');
const path = require('path');

class ResultsOrganizer {
  constructor() {
    this.organizedDir = path.join(__dirname, '..', 'output', 'organized');
    this.bestExamplesDir = path.join(this.organizedDir, 'best_examples');
    this.parametersDir = path.join(this.organizedDir, 'parameters');
    this.analysisDir = path.join(this.organizedDir, 'analysis');
    this.comparisonsDir = path.join(this.organizedDir, 'comparisons');
    this.futureDir = path.join(this.organizedDir, 'future_generation');
    
    this.ensureDirectories();
  }

  ensureDirectories() {
    const dirs = [
      this.organizedDir,
      this.bestExamplesDir,
      this.parametersDir,
      this.analysisDir,
      this.comparisonsDir,
      this.futureDir
    ];
    
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Find all generated images and their analysis results
   */
  findGeneratedImages() {
    const outputDir = path.join(__dirname, '..', 'output');
    const images = [];
    
    // Search in all subdirectories
    this.searchDirectory(outputDir, images, outputDir);
    
    return images;
  }

  searchDirectory(dir, images, outputDir) {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        this.searchDirectory(itemPath, images, outputDir);
      } else if (item.endsWith('.png')) {
        // Find corresponding analysis files
        const analysisFiles = this.findAnalysisFiles(itemPath);
        const parameterFiles = this.findParameterFiles(itemPath);
        
        images.push({
          imagePath: itemPath,
          relativePath: path.relative(outputDir, itemPath),
          filename: item,
          analysisFiles,
          parameterFiles,
          directory: path.dirname(itemPath)
        });
      }
    });
  }

  /**
   * Find analysis files for an image
   */
  findAnalysisFiles(imagePath) {
    const dir = path.dirname(imagePath);
    const baseName = path.basename(imagePath, '.png');
    const analysisFiles = [];
    
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        if (file.includes(baseName) && file.includes('.groq_vision') && file.endsWith('.json')) {
          analysisFiles.push({
            path: path.join(dir, file),
            filename: file,
            type: this.getAnalysisType(file)
          });
        }
      });
    }
    
    return analysisFiles;
  }

  /**
   * Find parameter files for an image
   */
  findParameterFiles(imagePath) {
    const dir = path.dirname(imagePath);
    const parameterFiles = [];
    
    // Look for batch_summary.json, collection_summary.json, etc.
    const summaryFiles = [
      'batch_summary.json',
      'collection_summary.json',
      'png_generation_summary.json',
      'experiment_summary.json'
    ];
    
    summaryFiles.forEach(file => {
      const filePath = path.join(dir, file);
      if (fs.existsSync(filePath)) {
        parameterFiles.push({
          path: filePath,
          filename: file,
          type: this.getParameterType(file)
        });
      }
    });
    
    return parameterFiles;
  }

  /**
   * Get analysis type from filename
   */
  getAnalysisType(filename) {
    if (filename.includes('single')) return 'single_analysis';
    if (filename.includes('comparison')) return 'comparison_analysis';
    return 'unknown_analysis';
  }

  /**
   * Get parameter type from filename
   */
  getParameterType(filename) {
    if (filename.includes('batch')) return 'batch_parameters';
    if (filename.includes('collection')) return 'collection_parameters';
    if (filename.includes('experiment')) return 'experiment_parameters';
    return 'unknown_parameters';
  }

  /**
   * Organize best examples based on AI ratings
   */
  organizeBestExamples(images) {
    console.log('🎨 Organizing best examples...');
    
    const bestExamples = [];
    
    images.forEach(image => {
      // Look for analysis files with high ratings
      image.analysisFiles.forEach(analysis => {
        try {
          const analysisData = JSON.parse(fs.readFileSync(analysis.path, 'utf8'));
          const analysisText = analysisData.results?.analysis || '';
          
          // Extract rating if present
          const ratingMatch = analysisText.match(/rating.*?(\d+)\/10|(\d+)\/10.*?rating/);
          const rating = ratingMatch ? parseInt(ratingMatch[1] || ratingMatch[2]) : null;
          
          // Look for positive keywords
          const positiveKeywords = ['complex', 'fractal', 'beautiful', 'interesting', 'unique', 'symmetry'];
          const keywordCount = positiveKeywords.filter(keyword => 
            analysisText.toLowerCase().includes(keyword)
          ).length;
          
          if (rating >= 7 || keywordCount >= 3) {
            bestExamples.push({
              ...image,
              rating,
              keywordCount,
              analysisText,
              analysisFile: analysis.path
            });
          }
        } catch (error) {
          console.log(`⚠️  Could not parse analysis for ${image.filename}: ${error.message}`);
        }
      });
    });
    
    // Sort by rating and keyword count
    bestExamples.sort((a, b) => {
      if (a.rating && b.rating) {
        return b.rating - a.rating;
      }
      return b.keywordCount - a.keywordCount;
    });
    
    console.log(`📊 Found ${bestExamples.length} high-quality examples`);
    
    // Copy best examples to organized directory
    bestExamples.forEach((example, index) => {
      const newFilename = `best_example_${(index + 1).toString().padStart(3, '0')}_${example.filename}`;
      const newPath = path.join(this.bestExamplesDir, newFilename);
      
      // Copy image
      fs.copyFileSync(example.imagePath, newPath);
      
      // Copy analysis file
      if (example.analysisFile) {
        const analysisFilename = `best_example_${(index + 1).toString().padStart(3, '0')}_analysis.json`;
        const analysisPath = path.join(this.bestExamplesDir, analysisFilename);
        fs.copyFileSync(example.analysisFile, analysisPath);
      }
      
      console.log(`✅ Copied: ${example.filename} (Rating: ${example.rating || 'N/A'})`);
    });
    
    return bestExamples;
  }

  /**
   * Organize parameters for reuse
   */
  organizeParameters(images) {
    console.log('📊 Organizing parameters for reuse...');
    
    const allParameters = [];
    
    images.forEach(image => {
      image.parameterFiles.forEach(paramFile => {
        try {
          const paramData = JSON.parse(fs.readFileSync(paramFile.path, 'utf8'));
          
          // Extract parameters from different file formats
          let parameters = null;
          if (paramData.images && paramData.images.length > 0) {
            parameters = paramData.images[0].parameters;
          } else if (paramData.parameters) {
            parameters = paramData.parameters;
          }
          
          if (parameters) {
            allParameters.push({
              source: image.filename,
              parameters,
              paramFile: paramFile.filename,
              timestamp: paramData.timestamp || new Date().toISOString()
            });
          }
        } catch (error) {
          console.log(`⚠️  Could not parse parameters from ${paramFile.filename}: ${error.message}`);
        }
      });
    });
    
    console.log(`📊 Found ${allParameters.length} parameter sets`);
    
    // Save organized parameters
    const parametersFile = path.join(this.parametersDir, 'all_parameters.json');
    fs.writeFileSync(parametersFile, JSON.stringify(allParameters, null, 2));
    
    // Create parameter categories
    const categories = {
      high_point_count: [],
      interesting_patterns: [],
      different_modes: [],
      different_projections: []
    };
    
    allParameters.forEach(param => {
      if (param.parameters.batchSize >= 5000) {
        categories.high_point_count.push(param);
      }
      if (param.parameters.mode !== undefined) {
        categories.different_modes.push(param);
      }
      if (param.parameters.projectionType !== undefined) {
        categories.different_projections.push(param);
      }
    });
    
    // Save categorized parameters
    Object.entries(categories).forEach(([category, params]) => {
      if (params.length > 0) {
        const categoryFile = path.join(this.parametersDir, `${category}_parameters.json`);
        fs.writeFileSync(categoryFile, JSON.stringify(params, null, 2));
        console.log(`📁 Saved ${params.length} ${category} parameters`);
      }
    });
    
    return allParameters;
  }

  /**
   * Organize analysis results
   */
  organizeAnalysis(images) {
    console.log('🤖 Organizing analysis results...');
    
    const allAnalysis = [];
    
    images.forEach(image => {
      image.analysisFiles.forEach(analysis => {
        try {
          const analysisData = JSON.parse(fs.readFileSync(analysis.path, 'utf8'));
          
          allAnalysis.push({
            image: image.filename,
            analysisType: analysis.type,
            analysis: analysisData,
            timestamp: analysisData.timestamp || new Date().toISOString()
          });
        } catch (error) {
          console.log(`⚠️  Could not parse analysis from ${analysis.filename}: ${error.message}`);
        }
      });
    });
    
    console.log(`📊 Found ${allAnalysis.length} analysis results`);
    
    // Save all analysis
    const analysisFile = path.join(this.analysisDir, 'all_analysis.json');
    fs.writeFileSync(analysisFile, JSON.stringify(allAnalysis, null, 2));
    
    // Create analysis summary
    const summary = {
      totalAnalysis: allAnalysis.length,
      byType: {},
      highRated: 0,
      complexPatterns: 0,
      fractalLike: 0
    };
    
    allAnalysis.forEach(analysis => {
      const type = analysis.analysisType;
      summary.byType[type] = (summary.byType[type] || 0) + 1;
      
      const text = analysis.analysis.results?.analysis || '';
      if (text.includes('8/10') || text.includes('9/10') || text.includes('10/10')) {
        summary.highRated++;
      }
      if (text.toLowerCase().includes('complex')) {
        summary.complexPatterns++;
      }
      if (text.toLowerCase().includes('fractal')) {
        summary.fractalLike++;
      }
    });
    
    const summaryFile = path.join(this.analysisDir, 'analysis_summary.json');
    fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
    
    console.log(`📈 Analysis Summary:`);
    console.log(`  High-rated images: ${summary.highRated}`);
    console.log(`  Complex patterns: ${summary.complexPatterns}`);
    console.log(`  Fractal-like: ${summary.fractalLike}`);
    
    return allAnalysis;
  }

  /**
   * Create comparison groups
   */
  createComparisons(images) {
    console.log('🔍 Creating comparison groups...');
    
    const comparisons = {
      by_mode: {},
      by_point_count: {},
      by_projection: {},
      by_complexity: {}
    };
    
    images.forEach(image => {
      // Group by mode
      const mode = this.extractMode(image.filename);
      if (mode) {
        if (!comparisons.by_mode[mode]) comparisons.by_mode[mode] = [];
        comparisons.by_mode[mode].push(image);
      }
      
      // Group by point count
      const pointCount = this.extractPointCount(image.filename);
      if (pointCount) {
        const range = this.getPointCountRange(pointCount);
        if (!comparisons.by_point_count[range]) comparisons.by_point_count[range] = [];
        comparisons.by_point_count[range].push(image);
      }
      
      // Group by projection
      const projection = this.extractProjection(image.filename);
      if (projection) {
        if (!comparisons.by_projection[projection]) comparisons.by_projection[projection] = [];
        comparisons.by_projection[projection].push(image);
      }
    });
    
    // Save comparison groups
    const comparisonsFile = path.join(this.comparisonsDir, 'comparison_groups.json');
    fs.writeFileSync(comparisonsFile, JSON.stringify(comparisons, null, 2));
    
    console.log(`📊 Comparison Groups:`);
    Object.entries(comparisons).forEach(([type, groups]) => {
      console.log(`  ${type}: ${Object.keys(groups).length} groups`);
    });
    
    return comparisons;
  }

  /**
   * Extract mode from filename
   */
  extractMode(filename) {
    if (filename.includes('plain_flip')) return 'plain_flip';
    if (filename.includes('flip_smallest')) return 'flip_smallest';
    if (filename.includes('flip_all_except_largest')) return 'flip_all_except_largest';
    return null;
  }

  /**
   * Extract point count from filename
   */
  extractPointCount(filename) {
    const match = filename.match(/(\d+)pts/);
    return match ? parseInt(match[1]) : null;
  }

  /**
   * Extract projection from filename
   */
  extractProjection(filename) {
    if (filename.includes('simple')) return 'simple';
    if (filename.includes('stereographic')) return 'stereographic';
    return null;
  }

  /**
   * Get point count range
   */
  getPointCountRange(pointCount) {
    if (pointCount < 1000) return 'low';
    if (pointCount < 5000) return 'medium';
    if (pointCount < 10000) return 'high';
    return 'very_high';
  }

  /**
   * Create future generation plan
   */
  createFuturePlan(bestExamples, parameters, analysis) {
    console.log('🚀 Creating future generation plan...');
    
    const plan = {
      timestamp: new Date().toISOString(),
      bestExamplesCount: bestExamples.length,
      parametersCount: parameters.length,
      analysisCount: analysis.length,
      recommendations: {
        highRatedParameters: [],
        interestingVariations: [],
        unexploredAreas: [],
        nextExperiments: []
      }
    };
    
    // Find high-rated parameters
    bestExamples.forEach(example => {
      if (example.rating >= 8) {
        // Find corresponding parameters
        const matchingParams = parameters.find(p => 
          p.source === example.filename || 
          example.relativePath.includes(p.source)
        );
        
        if (matchingParams) {
          plan.recommendations.highRatedParameters.push({
            image: example.filename,
            rating: example.rating,
            parameters: matchingParams.parameters
          });
        }
      }
    });
    
    // Suggest variations
    plan.recommendations.interestingVariations = [
      'Test different camera rotations with high-rated parameters',
      'Try stereographic projection with complex patterns',
      'Generate animations using parameter variations',
      'Create high-resolution versions of best examples'
    ];
    
    // Identify unexplored areas
    plan.recommendations.unexploredAreas = [
      'Very high point counts (20,000+)',
      'Different image aspect ratios',
      'Parameter mutation experiments',
      'Cross-mode comparisons'
    ];
    
    // Suggest next experiments
    plan.recommendations.nextExperiments = [
      'Generate 100+ images with best parameter types',
      'Create parameter animations for top-rated images',
      'Test different normalization modes',
      'Explore mathematical relationships between parameters'
    ];
    
    // Save future plan
    const planFile = path.join(this.futureDir, 'future_generation_plan.json');
    fs.writeFileSync(planFile, JSON.stringify(plan, null, 2));
    
    console.log(`📋 Future Generation Plan:`);
    console.log(`  High-rated parameters: ${plan.recommendations.highRatedParameters.length}`);
    console.log(`  Interesting variations: ${plan.recommendations.interestingVariations.length}`);
    console.log(`  Unexplored areas: ${plan.recommendations.unexploredAreas.length}`);
    
    return plan;
  }

  /**
   * Create organized README
   */
  createOrganizedREADME(bestExamples, parameters, analysis, comparisons, plan) {
    const readmeContent = `# 🎯 Organized Quaternion Attractor Results

**Generated:** ${new Date().toISOString()}

## 📊 **Results Summary**

- **Best Examples:** ${bestExamples.length} high-quality images
- **Parameter Sets:** ${parameters.length} reusable parameter combinations
- **Analysis Results:** ${analysis.length} AI analysis reports
- **Comparison Groups:** ${Object.keys(comparisons).length} comparison categories
- **Future Plan:** Comprehensive generation recommendations

## 🎨 **Best Examples** (${bestExamples.length} images)

Located in: \`best_examples/\`

${bestExamples.map((example, index) => 
  `${index + 1}. **${example.filename}** (Rating: ${example.rating || 'N/A'}) - ${example.keywordCount} positive keywords`
).join('\n')}

## 📊 **Parameters for Reuse**

Located in: \`parameters/\`

- **all_parameters.json** - Complete parameter database
- **high_point_count_parameters.json** - High-density parameter sets
- **different_modes_parameters.json** - Various flip mode parameters
- **different_projections_parameters.json** - Projection type parameters

## 🤖 **Analysis Results**

Located in: \`analysis/\`

- **all_analysis.json** - Complete analysis database
- **analysis_summary.json** - Statistical summary of analysis

**Key Statistics:**
- High-rated images: ${plan.recommendations.highRatedParameters.length}
- Complex patterns identified: ${analysis.filter(a => 
  a.analysis.results?.analysis?.toLowerCase().includes('complex')
).length}
- Fractal-like properties: ${analysis.filter(a => 
  a.analysis.results?.analysis?.toLowerCase().includes('fractal')
).length}

## 🔍 **Comparison Groups**

Located in: \`comparisons/\`

- **comparison_groups.json** - Images grouped by various criteria

**Available Comparisons:**
${Object.entries(comparisons).map(([type, groups]) => 
  `- **${type}**: ${Object.keys(groups).length} groups`
).join('\n')}

## 🚀 **Future Generation Plan**

Located in: \`future_generation/\`

- **future_generation_plan.json** - Comprehensive recommendations

**Next Steps:**
${plan.recommendations.nextExperiments.map(exp => `- ${exp}`).join('\n')}

**High-Rated Parameters for Reuse:**
${plan.recommendations.highRatedParameters.map(param => 
  `- ${param.image} (Rating: ${param.rating})`
).join('\n')}

## 🎯 **Usage Examples**

### **Reuse High-Rated Parameters**
\`\`\`bash
# Use parameters from best examples
node tools/parameter-experimenter.js parameters/best_parameters.json
\`\`\`

### **Compare Images by Category**
\`\`\`bash
# Compare images by mode
node tools/universal-groq-analyzer.js compare \\
  comparisons/by_mode/flip_smallest/image1.png \\
  comparisons/by_mode/flip_smallest/image2.png \\
  "Compare flip_smallest mode variations"
\`\`\`

### **Generate More Images**
\`\`\`bash
# Generate with best parameter types
npm run strategy:batch -- --parameters best_parameters.json
\`\`\`

## 📈 **Research Opportunities**

1. **Mathematical Analysis** - Study patterns in high-rated images
2. **Parameter Optimization** - Fine-tune best parameter combinations
3. **Fractal Analysis** - Calculate fractal dimensions
4. **Color Theory** - Study color distribution patterns
5. **Animation Generation** - Create parameter animations

---

**🎯 All results organized and ready for research and further exploration!**
`;

    const readmePath = path.join(this.organizedDir, 'README.md');
    fs.writeFileSync(readmePath, readmeContent);
    
    console.log(`📋 Created organized README: ${readmePath}`);
  }

  /**
   * Main organization function
   */
  organizeAll() {
    console.log('🎯 Organizing all quaternion attractor results...');
    console.log('================================================');
    
    // Find all generated images
    const images = this.findGeneratedImages();
    console.log(`📊 Found ${images.length} generated images`);
    
    // Organize best examples
    const bestExamples = this.organizeBestExamples(images);
    
    // Organize parameters
    const parameters = this.organizeParameters(images);
    
    // Organize analysis
    const analysis = this.organizeAnalysis(images);
    
    // Create comparisons
    const comparisons = this.createComparisons(images);
    
    // Create future plan
    const plan = this.createFuturePlan(bestExamples, parameters, analysis);
    
    // Create organized README
    this.createOrganizedREADME(bestExamples, parameters, analysis, comparisons, plan);
    
    console.log('\n🎉 Organization complete!');
    console.log('========================');
    console.log(`📁 Organized directory: ${this.organizedDir}`);
    console.log(`🎨 Best examples: ${bestExamples.length} images`);
    console.log(`📊 Parameters: ${parameters.length} sets`);
    console.log(`🤖 Analysis: ${analysis.length} results`);
    console.log(`🔍 Comparisons: ${Object.keys(comparisons).length} categories`);
    
    return {
      bestExamples,
      parameters,
      analysis,
      comparisons,
      plan
    };
  }
}

/**
 * Main execution
 */
async function main() {
  const organizer = new ResultsOrganizer();
  const results = organizer.organizeAll();
  
  console.log('\n🎯 NEXT STEPS');
  console.log('=============');
  console.log('1. Review organized results in output/organized/');
  console.log('2. Use best parameters for future generation');
  console.log('3. Compare images using organized groups');
  console.log('4. Follow future generation plan');
  console.log('5. Create more images with proven parameters');
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { ResultsOrganizer };
