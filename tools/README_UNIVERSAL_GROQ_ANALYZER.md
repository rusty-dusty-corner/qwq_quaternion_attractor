# 🎯 Universal Groq Image Analysis Tool

**A flexible, command-line tool for analyzing any image with custom instructions using Groq Vision API.**

## 🚀 **Quick Start**

```bash
# Analyze single image with custom prompt (persistent)
node tools/universal-groq-analyzer.js analyze image.png "What colors do you see in this attractor pattern?"

# Quick analysis with preset
node tools/universal-groq-analyzer.js quick image.png attractor-colors

# Compare two images
node tools/universal-groq-analyzer.js compare img1.png img2.png "Compare these patterns"

# List existing analyses for an image
node tools/universal-groq-analyzer.js list image.png
```

## 📋 **Commands**

### **analyze** - Single Image Analysis (Persistent)
```bash
node tools/universal-groq-analyzer.js analyze <image> <prompt>
```
- Analyzes a single image with custom prompt
- Saves analysis alongside original image automatically
- Skips re-analysis if already exists (use `--force` to override)

### **compare** - Image Comparison (Persistent)
```bash
node tools/universal-groq-analyzer.js compare <image1> <image2> <prompt>
```
- Compares two images with custom prompt
- Saves comparison file alongside first image
- Perfect for comparing attractor variations or performance tests

### **quick** - Preset Analysis (Persistent)
```bash
node tools/universal-groq-analyzer.js quick <image> <preset>
```
- Uses predefined analysis prompts
- Available presets: `attractor-colors`, `ui-elements`, `mathematical-patterns`, `visual-comparison`, `screenshot-analysis`

### **directory** - Batch Analysis
```bash
node tools/universal-groq-analyzer.js directory <path> <prompt>
```
- Analyzes all PNG/JPG images in a directory
- Useful for batch processing screenshots or test images

### **list** - Show Existing Analyses
```bash
node tools/universal-groq-analyzer.js list <image>
```
- Lists all analysis files for a specific image
- Shows timestamps, analysis types, and prompts

## 🎯 **Real-World Examples**

### **Analyze Attractor Colors**
```bash
node tools/universal-groq-analyzer.js quick output/png_examples/basic_attractor.png attractor-colors
```
**Creates**: `basic_attractor.groq_vision_single_ee0ec12f.json`

### **Compare Performance Tests**
```bash
node tools/universal-groq-analyzer.js compare \
  output/png_examples/performance/performance_500.png \
  output/png_examples/performance/performance_1000.png \
  "Compare the complexity and visual differences between these two performance test images"
```
**Creates**: `performance_500.groq_vision_comparison_d818f4e2.json`

### **Check UI Screenshots**
```bash
node tools/universal-groq-analyzer.js directory screenshots/browser "Do you see any UI buttons or error messages?"
```

### **Mathematical Pattern Analysis**
```bash
node tools/universal-groq-analyzer.js analyze output/png_examples/variations/plain_flip.png \
  "Analyze the mathematical patterns, symmetries, and fractal properties in this quaternion attractor visualization"
```

## 📁 **Persistent Analysis System**

### **File Naming Convention**
Analysis files are automatically saved alongside original images with predictable names:

```
Original Image:                    basic_attractor.png
Single Analysis:                   basic_attractor.groq_vision_single_a1b2c3d4.json
Comparison Analysis:               performance_500.groq_vision_comparison_e5f6g7h8.json
```

### **Hash-Based Uniqueness**
- Each prompt generates a unique 8-character hash
- Same prompt = same hash = reuses existing analysis
- Different prompt = different hash = new analysis file

### **Smart Caching**
- **First run**: Performs analysis and saves result
- **Subsequent runs**: Uses existing analysis (instant)
- **Force re-analysis**: Use `--force` flag to override cache

## ⚙️ **Options**

### **--force**
Force re-analysis even if file exists
```bash
node tools/universal-groq-analyzer.js analyze image.png "prompt" --force
```

### **--output <file>**
Save results to additional JSON file
```bash
node tools/universal-groq-analyzer.js analyze image.png "prompt" --output results.json
```

### **--model <model>**
Specify Groq model (default: meta-llama/llama-4-scout-17b-16e-instruct)
```bash
node tools/universal-groq-analyzer.js analyze image.png "prompt" --model "llama-3.1-70b-versatile"
```

### **--tokens <number>**
Max tokens (default: 1500)
```bash
node tools/universal-groq-analyzer.js analyze image.png "prompt" --tokens 2000
```

### **--temperature <number>**
Temperature (default: 0.3)
```bash
node tools/universal-groq-analyzer.js analyze image.png "prompt" --temperature 0.7
```

## 🎨 **Preset Prompts**

### **attractor-colors**
Analyze color patterns, gradients, and visual aesthetics of attractor images.

### **ui-elements**
Identify buttons, inputs, error messages, and interface state in screenshots.

### **mathematical-patterns**
Deep mathematical analysis of geometric structures, symmetries, and fractal properties.

### **visual-comparison**
Detailed comparison of visual differences, similarities, and evolutionary changes.

### **screenshot-analysis**
Comprehensive technical and UX analysis of application screenshots.

## 📊 **Output Format**

### **Analysis File Structure**
```json
{
  "timestamp": "2025-01-05T03:57:07.298Z",
  "tool": "Universal Groq Image Analyzer",
  "originalImage": "/path/to/image.png",
  "analysisType": "single",
  "prompt": "Analyze the colors...",
  "results": {
    "success": true,
    "analysis": "The image shows...",
    "model": "meta-llama/llama-4-scout-17b-16e-instruct"
  },
  "metadata": {
    "imageSize": 12345,
    "analysisFile": "/path/to/analysis.json"
  }
}
```

## 🔧 **Setup Requirements**

### **Environment Variables**
```bash
# Required
GROQ_API_KEY=your_groq_api_key_here

# Optional
GROQ_VISION_MODEL=meta-llama/llama-4-scout-17b-16e-instruct
```

### **Dependencies**
- Node.js
- groq-sdk
- dotenv

## 💡 **Use Cases**

### **Development Workflow**
1. **Generate images** with your attractor system
2. **Analyze colors** to understand visual patterns
3. **Compare variations** to optimize parameters
4. **Check screenshots** for UI issues
5. **Track changes** over time with persistent storage

### **Research & Analysis**
- Mathematical pattern recognition
- Visual complexity analysis
- Parameter optimization guidance
- Automated quality assessment

### **Testing & Validation**
- Screenshot analysis for UI tests
- Performance comparison between versions
- Automated visual regression testing
- Interface functionality verification

## 🎉 **Benefits**

### **Time Saving**
- **Persistent storage**: No re-analysis of same images
- **Batch processing**: Analyze entire directories
- **Smart caching**: Instant results for repeated queries

### **Flexibility**
- **Custom prompts**: Any analysis instruction you need
- **Multiple formats**: Single, comparison, batch analysis
- **Extensible**: Easy to add new preset prompts

### **Integration**
- **Predictable naming**: Easy to find and compare analyses
- **JSON output**: Machine-readable results
- **Command-line**: Fits into any workflow

---

**🎯 Ready to analyze any image with custom instructions! Perfect for attractor research, UI testing, and visual analysis workflows.**
