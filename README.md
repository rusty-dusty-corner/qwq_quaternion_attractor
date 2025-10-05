# 🎨 Quaternion Attractor

**Generate beautiful mathematical attractor patterns using quaternion mathematics**

[![Nix](https://img.shields.io/badge/Environment-Nix-blue.svg)](shell.nix)
[![TypeScript](https://img.shields.io/badge/Code-TypeScript-blue.svg)](src/typescript/)
[![WebAssembly](https://img.shields.io/badge/Engine-WebAssembly-green.svg)](legacy2/)
[![Performance](https://img.shields.io/badge/Performance-11K%20pts%2Fsec-green.svg)](src/examples/)

---

## 🚀 **Quick Start**

```bash
# 1. Enter development environment
nix-shell

# 2. Install dependencies
npm install

# 3. Generate beautiful attractor patterns
npm run example:png

# 4. Check results
ls -la output/png_examples/
```

**Result:** Beautiful mathematical patterns generated as high-quality PNG images!

---

## 🎯 **What This Does**

Generates stunning mathematical attractor patterns using quaternion mathematics and renders them as high-quality PNG images.

### **Features**
- ✅ **Mathematical Engine**: Complete quaternion attractor implementation
- ✅ **PNG Rendering**: High-quality image generation with statistics
- ✅ **Multiple Algorithms**: Plain flip, flip smallest, flip all except largest
- ✅ **High Performance**: 11,000+ points/second generation
- ✅ **Cross-Platform**: Works in Node.js and browser

### **Example Output**
```
Performance Summary:
  500 points:   1193 pts/sec,  419ms total
 1000 points:   2049 pts/sec,  488ms total
 2000 points:   7018 pts/sec,  285ms total
 5000 points:  11792 pts/sec,  424ms total
```

---

## 🛠️ **Available Commands**

```bash
# Generate Examples
npm run example:png        # Generate PNG examples
npm run example:api        # Run API usage examples

# Development
npm run build:typescript   # Build TypeScript code
npm run build:assembly     # Build WebAssembly

# Universal Groq Analysis (NEW)
npm run groq:analyze       # Analyze single image with custom prompt
npm run groq:compare       # Compare two images
npm run groq:quick         # Quick analysis with presets
npm run groq:directory     # Analyze directory of images
npm run groq:list          # List existing analyses
npm run groq:presets       # Show available preset prompts
```

---

## 🎨 **Customization**

### **Modify Parameters**
Edit `src/examples/png-generation-example.ts`:

```typescript
const constants = {
  start: createQuaternion(0.8, 0.1, 0.2, 0.3),
  additive: createVector3D(0.1, 0.1, 0.1),
  wind: createQuaternion(0.9, 0.05, 0.05, 0.05),
  mode: SideFlipMode.FLIP_SMALLEST
};

const renderParams = {
  batchSize: 2000  // Number of points to generate
};
```

### **Algorithm Variations**
- **Plain Flip**: Simple hemisphere flipping
- **Flip Smallest**: Flip the smallest coordinate component
- **Flip All Except Largest**: Flip all except the largest component

---

## 📊 **Performance**

Current performance benchmarks:
- **Generation**: 11,000+ points/second
- **Rendering**: 200-500ms for 1000-5000 points
- **Memory**: Optimized for large point sets
- **Quality**: High-resolution PNG output

---

## 🚧 **Current Status**

### **✅ Working**
- TypeScript mathematical engine
- PNG rendering with statistics
- Node.js examples and CLI
- WebAssembly implementation
- Analysis tools with AI

### **🚧 Known Issues**
- Browser integration (ES module issues)
- Under-sampling bug with large point counts
- Code duplication between implementations

---

## 🆘 **Troubleshooting**

### **Build Issues**
```bash
npm run clean && npm run build:typescript
```

### **Environment Issues**
```bash
exit && nix-shell
```

### **Examples Don't Work**
```bash
ls -la dist/ && npm run build:typescript
```

---

## 🤝 **Contributing**

### **For Developers**
👉 **See `README_DEVELOPER.md`** - Complete developer guide

### **Development Workflow**
1. **Read developer guide** for complete context
2. **Test current functionality** with examples
3. **Focus on critical issues** (under-sampling bug)
4. **Maintain backward compatibility**

---

## 📄 **License**

MIT License - see LICENSE file for details.

---

## 🎯 **Learn More**

- **For Users**: This README
- **For Developers**: `README_DEVELOPER.md`
- **Documentation**: `docs/` directory
- **Analysis Reports**: `docs/archive/`

---

*Generate beautiful mathematical art with quaternion attractors!*