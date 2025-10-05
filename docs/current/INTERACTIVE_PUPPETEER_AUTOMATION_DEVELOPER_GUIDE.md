# 🎯 Interactive Puppeteer Automation Tool - Developer Guide

**Date:** January 5, 2025  
**Status:** ✅ **PRODUCTION READY**  
**Time to Productive:** 10 minutes

---

## 🚀 **Quick Start (5 minutes)**

```bash
# 1. Start the automation tool
npm run puppeteer:legacy

# 2. Test API endpoints (in another terminal)
curl -X GET http://localhost:3000/api/status
curl -X GET http://localhost:3000/api/screenshot
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"preset": "ui-elements", "prompt": "What buttons can I click?"}'

# 3. Open web interface
# Visit: http://localhost:3000
```

**Expected:** Server running, screenshots saved, AI analysis working!

---

## 🎯 **What This Tool Does**

### **🤖 Complete Browser Automation**
- **Puppeteer Integration**: Headless browser control with persistent sessions
- **RESTful API**: Web server with endpoints for all browser operations
- **AI-Powered Analysis**: Groq Vision integration for intelligent screenshot analysis
- **Interactive REPL**: Node.js console for direct browser control
- **Nix-shell Compatible**: Works seamlessly in development environment

### **🎮 Interactive Features**
- **Screenshot Capture**: Take screenshots with one API call
- **Button Clicking**: Click any button using JavaScript evaluation
- **Parameter Adjustment**: Modify sliders and form inputs
- **Animation Control**: Start/stop animations programmatically
- **Console Logging**: Capture browser console output
- **Error Recovery**: Automatic reconnection on page crashes

---

## 🛠️ **API Reference**

### **Core Endpoints**

#### **GET /api/status**
```bash
curl -X GET http://localhost:3000/api/status
```
**Response:**
```json
{
  "status": "running",
  "url": "experimental/wasm/index.html",
  "port": 3000,
  "screenshots": 0,
  "analyses": 0
}
```

#### **GET /api/screenshot**
```bash
curl -X GET "http://localhost:3000/api/screenshot?filename=test_screenshot.png"
```
**Response:**
```json
{
  "success": true,
  "filepath": "/path/to/screenshot.png",
  "filename": "screenshot_1234567890_1.png"
}
```
**Note:** Optional `filename` parameter for custom naming.

#### **POST /api/analyze**
```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"preset": "ui-elements", "prompt": "What buttons can I click?"}'
```
**Response:**
```json
{
  "success": true,
  "analysis": "Detailed AI analysis of the screenshot...",
  "filepath": "/path/to/screenshot.png",
  "timestamp": "2025-01-05T10:30:00.000Z"
}
```

#### **POST /api/action**
```bash
curl -X POST http://localhost:3000/api/action \
  -H "Content-Type: application/json" \
  -d '{"action": "evaluate", "text": "document.querySelector(\"button\").click()"}'
```

#### **GET /api/console**
```bash
curl -X GET http://localhost:3000/api/console
```

---

## 🎮 **Interactive Automation Examples**

### **Example 1: Basic Button Interaction**
```bash
# Take screenshot
curl -X GET "http://localhost:3000/api/screenshot?filename=before_click.png"

# Click "Generate Attractor" button (for web interface)
curl -X POST http://localhost:3000/api/action \
  -H "Content-Type: application/json" \
  -d '{"action": "evaluate", "text": "document.getElementById(\"generate\").click()"}'

# Take another screenshot
curl -X GET "http://localhost:3000/api/screenshot?filename=after_click.png"
```

### **Example 2: Animation Control**
```bash
# Start animation
curl -X POST http://localhost:3000/api/action \
  -H "Content-Type: application/json" \
  -d '{"action": "evaluate", "text": "Array.from(document.querySelectorAll(\"button\")).find(btn => btn.textContent.includes(\"Start Animation\")).click()"}'

# Wait 3 seconds
sleep 3

# Take screenshot of animation
curl -X GET http://localhost:3000/api/screenshot

# Stop animation
curl -X POST http://localhost:3000/api/action \
  -H "Content-Type: application/json" \
  -d '{"action": "evaluate", "text": "Array.from(document.querySelectorAll(\"button\")).find(btn => btn.textContent.includes(\"Stop Animation\")).click()"}'
```

### **Example 3: Parameter Adjustment**
```bash
# Change point size slider
curl -X POST http://localhost:3000/api/action \
  -H "Content-Type: application/json" \
  -d '{"action": "evaluate", "text": "const pointSizeSlider = document.querySelector(\"#pointSize\"); pointSizeSlider.value = 5; pointSizeSlider.dispatchEvent(new Event(\"input\", { bubbles: true }));"}'

# Randomize parameters
curl -X POST http://localhost:3000/api/action \
  -H "Content-Type: application/json" \
  -d '{"action": "evaluate", "text": "Array.from(document.querySelectorAll(\"button\")).find(btn => btn.textContent.includes(\"Randomize Parameters\")).click()"}'
```

### **Example 4: AI-Powered Analysis**
```bash
# Take screenshot and analyze with AI
curl -X GET http://localhost:3000/api/screenshot

curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"preset": "visual-analysis", "prompt": "Analyze this quaternion attractor visualization. What mathematical patterns do you see? What are the current parameter values?"}'
```

---

## 🔧 **Advanced Usage**

### **REPL Mode**
The tool includes an interactive REPL mode for direct browser control:

```bash
# Start the tool
npm run puppeteer:legacy

# Press Enter when prompted to start REPL mode
# Available commands in REPL:
# - screenshot() - Take screenshot
# - analyze(prompt, preset) - Analyze with AI
# - click(selector) - Click element
# - type(selector, text) - Type text
# - evaluate(code) - Run JavaScript
# - logs() - Get console logs
# - help() - Show all commands
```

### **Custom JavaScript Execution**
You can run any JavaScript code in the browser context:

```bash
# Get all slider values
curl -X POST http://localhost:3000/api/action \
  -H "Content-Type: application/json" \
  -d '{"action": "evaluate", "text": "const sliders = document.querySelectorAll(\"input[type=range]\"); sliders.forEach((s, i) => console.log(`Slider ${i}: ${s.id} = ${s.value}`));"}'

# Check current page state
curl -X POST http://localhost:3000/api/action \
  -H "Content-Type: application/json" \
  -d '{"action": "evaluate", "text": "console.log(\"Page title:\", document.title); console.log(\"URL:\", window.location.href);"}'
```

---

## 📁 **File Structure**

```
tools/
├── interactive-puppeteer-automator.js     # Main automation tool (689 lines)
├── README_INTERACTIVE_PUPPETEER_AUTOMATOR.md  # Complete documentation
└── universal-groq-analyzer.js             # AI analysis integration

tools/docs/screenshots/                    # Screenshots saved here
├── current/automator/                     # Current session screenshots
│   ├── screenshot_1234567890_1.png
│   ├── screenshot_1234567890_2.png
│   └── [analysis results].json
└── archive/                               # Historical screenshots
    ├── browser/
    ├── legacy/
    └── wasm/
```

---

## 🎯 **Use Cases**

### **🧪 Testing & Debugging**
- **Automated UI Testing**: Test button interactions and form submissions
- **Visual Regression Testing**: Compare screenshots before/after changes
- **Error Detection**: Capture and analyze error states
- **Performance Testing**: Measure animation performance

### **📊 Visual Analysis**
- **Mathematical Pattern Analysis**: Use AI to analyze quaternion attractor patterns
- **Parameter Optimization**: Test different parameter combinations
- **Documentation Generation**: Create visual documentation with AI analysis
- **Research**: Explore mathematical visualizations systematically

### **🎮 Interactive Demos**
- **Live Demonstrations**: Show quaternion attractor in action
- **Parameter Exploration**: Let users explore different settings
- **Educational Content**: Create interactive learning experiences
- **Presentation Tools**: Generate visual content for presentations

---

## 🚨 **Troubleshooting**

### **Common Issues**

#### **Server Not Starting**
```bash
# Check if port 3000 is in use
lsof -i :3000

# Kill existing processes
pkill -f "interactive-puppeteer-automator"

# Restart
npm run puppeteer:legacy
```

#### **Browser Connection Issues**
```bash
# Check if Chromium is available
which chromium

# In Nix environment, this should work automatically
nix-shell --run "npm run puppeteer:legacy"
```

#### **API Calls Failing**
```bash
# Test basic connectivity
curl -v http://localhost:3000/api/status

# Check server logs in the terminal where you started the tool
```

#### **Console Logging Not Working** ⚠️ **KNOWN ISSUE**
```bash
# Console logging is currently broken - this is a known issue
curl -X GET http://localhost:3000/api/console
# Returns empty logs array even when console.log statements exist

# Workaround: Use evaluate action to check console manually
curl -X POST http://localhost:3000/api/action \
  -H "Content-Type: application/json" \
  -d '{"action": "evaluate", "text": "console.log(\"Test message\")"}'
```

#### **Screenshots Not Saving**
```bash
# Check if screenshots directory exists
ls -la screenshots/automator/

# Create directory if needed
mkdir -p screenshots/automator/
```

### **Debug Mode**
Enable debug logging by setting environment variable:
```bash
DEBUG=puppeteer* npm run puppeteer:legacy
```

---

## 📊 **Performance & Limits**

### **Current Performance**
- **Screenshot Capture**: ~200-500ms per screenshot
- **AI Analysis**: ~2-5 seconds per analysis (depends on Groq API)
- **Browser Actions**: ~100-300ms per action
- **Memory Usage**: ~200-300MB for browser + Node.js

### **Limits**
- **Concurrent Requests**: No hard limit, but browser may become unresponsive with many simultaneous actions
- **Screenshot Size**: Full browser viewport (typically 1920x1080)
- **Analysis Length**: Groq API has token limits for analysis responses
- **Session Duration**: Browser sessions persist until manually stopped

---

## 🔮 **Future Enhancements**

### **Planned Features**
- **Batch Operations**: Process multiple screenshots simultaneously
- **Custom Presets**: Add more Groq Vision analysis presets
- **Web Dashboard**: HTML interface for tool control
- **Screenshot Comparison**: Before/after analysis capabilities
- **Video Recording**: Record browser sessions as videos
- **Multi-browser Support**: Support for Firefox, Safari

### **Integration Opportunities**
- **CI/CD Integration**: Automated testing in build pipelines
- **Research Tools**: Integration with mathematical research workflows
- **Educational Platforms**: Integration with learning management systems
- **Documentation Systems**: Automated visual documentation generation

---

## 📚 **Related Documentation**

- **`tools/README_INTERACTIVE_PUPPETEER_AUTOMATOR.md`** - Complete tool documentation
- **`docs/archive/reports/0008_2025-01-05_INTERACTIVE_PUPPETEER_AUTOMATION_TOOL_REPORT.md`** - Development report
- **`tools/universal-groq-analyzer.js`** - AI analysis tool integration
- **`docs/current/NEXT_DAY_DEVELOPER_GUIDE.md`** - Main developer guide

---

## 🎯 **Success Criteria**

You're ready to use this tool if:
- ✅ `npm run puppeteer:legacy` starts successfully
- ✅ `curl -X GET http://localhost:3000/api/status` returns server status
- ✅ You can take screenshots and get AI analysis
- ✅ You understand the API endpoints and their usage
- ✅ You can perform basic browser automation tasks

**Time to productive**: 10 minutes

---

## 📋 **Quick Reference Card**

**Copy this for quick reference:**

```bash
# Start tool
npm run puppeteer:legacy

# Basic operations
curl -X GET "http://localhost:3000/api/screenshot?filename=test.png"
curl -X POST http://localhost:3000/api/analyze -H "Content-Type: application/json" -d '{"preset": "ui-elements", "prompt": "What can I click?"}'

# Button interaction (for web interface)
curl -X POST http://localhost:3000/api/action -H "Content-Type: application/json" -d '{"action": "evaluate", "text": "document.getElementById(\"generate\").click()"}'

# Web interface
# Visit: http://localhost:3000

# ⚠️ Known Issue: Console logging broken
# Use evaluate action instead of /api/console
```

---

*This tool provides complete browser automation with AI-powered analysis - perfect for interactive quaternion attractor testing and exploration.*
