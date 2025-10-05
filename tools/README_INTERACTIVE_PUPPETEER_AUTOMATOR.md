# 🎯 Interactive Puppeteer Automation Tool

**A powerful automation tool that combines Puppeteer browser control with Groq Vision analysis for intelligent web automation.**

## 🚀 **Quick Start**

```bash
# Start with experimental/wasm/index.html (default)
npm run puppeteer:legacy

# Or with custom URL and port
npm run puppeteer:automator -- [url] [port]

# Examples
npm run puppeteer:automator -- experimental/wasm/index.html 3000
npm run puppeteer:automator -- http://localhost:8080 3001
```

## 🎮 **What This Tool Does**

### **🖥️ Interactive Web Interface**
- **Real-time Control**: Web interface at `http://localhost:3000`
- **Screenshot Capture**: Take screenshots with one click
- **Groq Vision Analysis**: AI-powered analysis of what's on screen
- **Puppeteer Actions**: Click, type, navigate, evaluate JavaScript

### **🤖 AI-Powered Automation**
- **Visual Understanding**: Groq Vision tells you what's on the page
- **Smart Suggestions**: AI suggests next actions based on screen content
- **Automated Analysis**: Analyze UI elements, patterns, errors automatically

### **💻 Node.js REPL Mode**
- **Interactive Commands**: Control Puppeteer directly from terminal
- **Dynamic Scripting**: Run JavaScript code in browser context
- **Real-time Feedback**: See results immediately

## 💡 **Best Practices: When to Use Which Tool**

### **Use Puppeteer Automator For:**
- **Interactive Testing**: When you need to click buttons, fill forms, navigate pages
- **Real-time Analysis**: When you want to see live browser behavior
- **Dynamic Content**: When content changes based on user interactions
- **Debugging**: When you need to see console logs and errors in real-time

### **Use Direct Groq Tool For:**
- **Image Comparisons**: Comparing two or more screenshots (much more efficient)
- **Batch Analysis**: Analyzing multiple images at once
- **Static Analysis**: When you already have screenshots saved
- **Detailed Comparisons**: When you need precise visual difference analysis

### **Workflow Recommendation:**
1. **Use Puppeteer** to capture screenshots and interact with the page
2. **Use Direct Groq Tool** to compare and analyze the captured screenshots
3. **Use Puppeteer** again if you need to take more screenshots based on analysis

## 🎯 **Use Cases**

### **🧪 Testing & Debugging**
```bash
# Start automator on your app
npm run puppeteer:test

# Take screenshot and analyze
# AI will tell you what buttons/errors are visible
# Click buttons, fill forms, test functionality
```

### **📊 Visual Analysis**
```bash
# Analyze attractor visualizations
npm run puppeteer:legacy

# Take screenshots of different parameters
# Use Groq Vision to compare patterns
# Identify visual differences automatically

# 💡 BETTER APPROACH: Use direct Groq tool for comparisons
node tools/universal-groq-analyzer.js compare screenshot1.png screenshot2.png "Compare these patterns"
# This is more efficient than using the puppeteer API for comparisons
```

### **🔍 UI Exploration**
```bash
# Explore any website
npm run puppeteer:automator -- https://example.com

# Let AI analyze the interface
# Get suggestions for what to click
# Navigate intelligently
```

## 🛠️ **How It Works**

### **1. Browser Automation**
- Launches Puppeteer with visible browser
- Navigates to target URL (file:// or http://)
- Captures console logs and errors
- Provides real-time browser control

### **2. Groq Vision Integration**
- Takes screenshots automatically
- Sends images to Groq Vision API
- Gets AI analysis of visual content
- Suggests next actions based on what's seen

### **3. Web Interface**
- Serves control panel at `http://localhost:PORT`
- Real-time screenshot display
- One-click actions (click, type, analyze)
- History of all actions and analyses

### **4. REPL Mode**
- Interactive Node.js environment
- Direct Puppeteer method access
- JavaScript evaluation in browser
- Real-time feedback and debugging

## 📋 **Available Actions**

### **Web Interface Actions**
- **Screenshot**: Capture current page state
- **Analyze**: Use Groq Vision to understand content
- **Click**: Click on elements by CSS selector
- **Type**: Enter text into form fields
- **Evaluate**: Run JavaScript code in browser
- **Navigate**: Go to different URLs
- **Wait**: Wait for elements to appear

### **REPL Commands**
```javascript
// Take screenshot
screenshot()

// Analyze with Groq Vision
analyze("What buttons do you see on this page?", "ui-elements")

// Click element
click("#submit-button")

// Type text
type("#username", "testuser")

// Run JavaScript
evaluate("document.title")

// Wait for element
wait(".loading-complete")

// Navigate
navigate("https://example.com")

// Get console logs
logs()

// Show help
help()
```

## 🎨 **Groq Vision Presets**

### **ui-elements**
Identifies buttons, inputs, error messages, and interface state.

### **screenshot-analysis**
Comprehensive technical and UX analysis of application screenshots.

### **attractor-colors**
Analyzes color patterns, gradients, and visual aesthetics of attractor images.

### **mathematical-patterns**
Deep mathematical analysis of geometric structures, symmetries, and fractal properties.

### **Custom Prompts**
Write any analysis instruction:
- "What error messages do you see?"
- "Are there any broken images or layout issues?"
- "What interactive elements are available?"
- "Compare this with the previous screenshot"

## 📊 **API Endpoints**

The tool exposes REST API endpoints:

### **GET /api/status**
Returns current status and statistics.

### **GET /api/screenshot**
Takes and returns base64-encoded screenshot.

### **POST /api/analyze**
Analyzes current page with Groq Vision.
```json
{
  "prompt": "What buttons do you see?",
  "preset": "ui-elements"
}
```

### **GET /api/console**
Returns browser console logs.

### **POST /api/action**
Performs Puppeteer actions.
```json
{
  "action": "click",
  "selector": "#submit-button"
}
```

## 🔧 **Configuration**

### **Environment Variables**
```bash
# Required for Groq Vision analysis
GROQ_API_KEY=your_groq_api_key_here

# Optional
GROQ_VISION_MODEL=meta-llama/llama-4-scout-17b-16e-instruct
```

### **Browser Options**
The tool launches Puppeteer with:
- `headless: false` - Visible browser for debugging
- `--no-sandbox` - For containerized environments
- `--disable-setuid-sandbox` - Security compatibility

## 📁 **File Organization**

### **Screenshots**
Screenshots are saved to:
```
screenshots/automator/
├── screenshot_1704567890123_1.png
├── screenshot_1704567890456_2.png
└── temp_analysis_1704567890789.png
```

### **Analysis Results**
Groq Vision analyses are saved alongside screenshots:
```
screenshots/automator/
├── screenshot_1704567890123_1.png
├── screenshot_1704567890123_1.groq_vision_single_a1b2c3d4.json
└── screenshot_1704567890456_2.png
```

## 🎯 **Real-World Examples**

### **Testing Legacy Attractor Interface**
```bash
# Start automator on legacy interface
npm run puppeteer:legacy

# 1. Take screenshot
# 2. Analyze with "ui-elements" preset
# 3. AI tells you: "I see a canvas element and parameter controls"
# 4. Click on parameter inputs
# 5. Type new values
# 6. Take another screenshot
# 7. Analyze with "attractor-colors" preset
# 8. AI compares the visual changes
```

### **Debugging Web Application**
```bash
# Start automator on your app
npm run puppeteer:automator -- http://localhost:8080

# 1. Take screenshot
# 2. Analyze with "screenshot-analysis" preset
# 3. AI identifies: "I see an error message in red text"
# 4. Click "Retry" button
# 5. Wait for loading to complete
# 6. Take final screenshot
# 7. Verify error is resolved
```

### **Exploring Unknown Interface**
```bash
# Start on any website
npm run puppeteer:automator -- https://example.com

# 1. Take screenshot
# 2. Analyze with custom prompt: "What can I click on this page?"
# 3. AI responds: "I see a navigation menu, search box, and content links"
# 4. Click on suggested elements
# 5. Navigate and explore automatically
```

## 🚀 **Advanced Features**

### **Batch Analysis**
```bash
# Take multiple screenshots and analyze
for i in {1..5}; do
  screenshot()
  analyze("Compare this with previous screenshots", "visual-comparison")
done
```

### **Automated Testing**
```bash
# Automated test sequence
click("#login-button")
type("#username", "testuser")
type("#password", "testpass")
click("#submit")
wait(".dashboard")
analyze("Is the login successful?", "ui-elements")
```

### **Visual Regression Testing**
```bash
# Compare before/after screenshots
screenshot()  # Before
# Make changes
screenshot()  # After
analyze("Compare these two screenshots", "visual-comparison")
```

## 🆘 **Troubleshooting**

### **Browser Won't Launch**
```bash
# Install dependencies
npm install

# Check Puppeteer installation
npx puppeteer browsers list
```

### **Groq Vision Not Working**
```bash
# Check API key
echo $GROQ_API_KEY

# Test with simple image
npm run groq:quick -- image.png ui-elements
```

### **Port Already in Use**
```bash
# Use different port
npm run puppeteer:automator -- experimental/wasm/index.html 3001
```

## 🎉 **Benefits**

### **🚀 Speed**
- **Instant Screenshots**: Capture page state immediately
- **AI Analysis**: Understand content without manual inspection
- **Automated Actions**: Click and type without writing scripts

### **🧠 Intelligence**
- **Visual Understanding**: AI tells you what's on the page
- **Smart Suggestions**: Get recommendations for next actions
- **Pattern Recognition**: Identify errors, changes, and issues

### **🔧 Flexibility**
- **Any Website**: Works with file://, http://, or https://
- **Custom Analysis**: Write any analysis prompt you need
- **Interactive Control**: Web interface + REPL mode

### **📊 Persistence**
- **Screenshot History**: All captures saved automatically
- **Analysis Storage**: Groq Vision results cached and searchable
- **Action Logging**: Complete history of all automation steps

---

**🎯 Ready to automate any web interface with AI-powered intelligence!**

*Perfect for testing, debugging, visual analysis, and intelligent web automation.*
