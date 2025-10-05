# 📸 Screenshots Organization

This directory contains organized screenshots from the Quaternion Attractor project.

## 📁 **Structure**

### **`archive/`**
Historical screenshots from previous development sessions:
- **`analysis/`** - Screenshot analysis results and comparisons
- **`browser/`** - Browser interface screenshots and tests
- **`legacy/`** - Legacy system screenshots
- **`wasm/`** - WebAssembly implementation screenshots

### **`current/`**
Current development session screenshots:
- **`automator/`** - Screenshots from Puppeteer automation tool

## 🎯 **Usage**

### **Taking New Screenshots**
```bash
# Using Puppeteer automator
npm run puppeteer:automator -- web/index.html 3000
# Screenshots automatically saved to current/automator/

# Using direct Groq tool
node tools/universal-groq-analyzer.js analyze screenshot.png "What do you see?"
```

### **Analyzing Screenshots**
```bash
# Analyze with Groq Vision
node tools/universal-groq-analyzer.js quick screenshot.png ui-elements

# Compare screenshots
node tools/universal-groq-analyzer.js compare before.png after.png "Compare these patterns"
```

## 📊 **File Naming Convention**

- **Automator screenshots**: `screenshot_[timestamp]_[sequence].png`
- **Analysis results**: `[original].groq_vision_[type]_[hash].json`
- **Manual screenshots**: `[descriptive-name].png`

## 🔄 **Maintenance**

- Move completed session screenshots from `current/` to `archive/` when done
- Keep only recent screenshots in `current/` for active development
- Archive screenshots by date and session type
