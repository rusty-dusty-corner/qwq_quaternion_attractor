# 🕰️ Legacy Groq Analysis Code

**Date Moved:** January 5, 2025  
**Status:** Legacy - Use new universal tool instead

---

## 📁 **What's Here**

This directory contains the **old Groq analysis code** that has been replaced by the new universal tool.

### **Directory Structure**
```
legacy/groq-analysis/
├── examples/           # Old TypeScript examples
│   ├── groq-vision-analysis-example.ts
│   ├── analyze-legacy-screenshots.ts
│   ├── detailed-visual-analysis.ts
│   └── test-groq-integration.ts
├── core/               # Old core analyzer class
│   └── groq-vision-analyzer.ts
└── scripts/            # Old JavaScript scripts
    └── analyze-browser-screenshots.js
```

---

## 🚀 **Use New Universal Tool Instead**

### **❌ Old Way (Don't Use)**
```bash
# These commands no longer work:
npm run example:groq
npm run analyze:detailed
npm run analyze:screenshots
npm run test:groq
```

### **✅ New Way (Use This)**
```bash
# Universal Groq Analysis Tool
npm run groq:analyze       # Analyze single image with custom prompt
npm run groq:compare       # Compare two images
npm run groq:quick         # Quick analysis with presets
npm run groq:directory     # Analyze directory of images
npm run groq:list          # List existing analyses
npm run groq:presets       # Show available preset prompts

# Examples:
npm run groq:quick -- output/png_examples/basic_attractor.png attractor-colors
npm run groq:compare -- image1.png image2.png "Compare these patterns"
```

---

## 🔄 **Migration Benefits**

### **Old Tool Problems**
- ❌ **Hardcoded prompts** - Fixed analysis instructions
- ❌ **Complex build process** - Required TypeScript compilation
- ❌ **No persistence** - Re-analyzed same images repeatedly
- ❌ **Limited flexibility** - Couldn't customize analysis
- ❌ **Scattered code** - Multiple files with different approaches

### **New Tool Benefits**
- ✅ **Flexible prompts** - Any custom analysis instruction
- ✅ **No build required** - Direct Node.js execution
- ✅ **Persistent storage** - Saves analysis alongside images
- ✅ **Smart caching** - Reuses existing analysis
- ✅ **Unified interface** - Single tool for all analysis needs
- ✅ **Predictable naming** - Easy to find and compare analyses

---

## 📋 **What Was Moved**

### **From `src/examples/`**
- `groq-vision-analysis-example.ts` - Complex hardcoded example
- `analyze-legacy-screenshots.ts` - Legacy screenshot analysis
- `detailed-visual-analysis.ts` - Detailed analysis example
- `test-groq-integration.ts` - Integration test

### **From `src/typescript/node/`**
- `groq-vision-analyzer.ts` - Core analyzer class (used by examples)

### **From `tests/analysis/`**
- `analyze-browser-screenshots.js` - Browser screenshot analysis

---

## 🎯 **Why This Code Exists**

This legacy code is preserved for:
- **Reference** - Understanding the evolution of analysis tools
- **Historical context** - Seeing how analysis was done before
- **Fallback** - If needed for specific legacy analysis tasks
- **Learning** - Examples of different analysis approaches

---

## 📚 **Documentation**

- **New Tool**: See `tools/README_UNIVERSAL_GROQ_ANALYZER.md`
- **Migration Plan**: See `LEGACY_MIGRATION_PLAN.md`
- **Project Status**: See `README_DEVELOPER.md`

---

**🎯 Use the new universal Groq analysis tool for all current analysis needs. This legacy code is preserved for reference only.**
