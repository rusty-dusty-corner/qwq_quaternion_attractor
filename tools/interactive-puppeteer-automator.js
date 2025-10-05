#!/usr/bin/env node

/**
 * 🎯 Interactive Puppeteer Automation Tool
 * 
 * A powerful tool that combines:
 * - Puppeteer automation with interactive control
 * - Groq Vision analysis of screenshots
 * - Web server for real-time feedback
 * - Node.js REPL mode for dynamic control
 * 
 * Usage:
 *   node tools/interactive-puppeteer-automator.js [url] [port]
 * 
 * Examples:
 *   node tools/interactive-puppeteer-automator.js experimental/wasm/index.html 3000
 *   node tools/interactive-puppeteer-automator.js http://localhost:8080 3001
 */

const puppeteer = require('puppeteer');
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');
const crypto = require('crypto');

// Import the universal Groq analyzer
const { UniversalGroqAnalyzer, PRESET_PROMPTS } = require('./universal-groq-analyzer.js');

class InteractivePuppeteerAutomator {
  constructor(options = {}) {
    this.url = options.url || 'experimental/wasm/index.html';
    this.port = options.port || 3000;
    this.browser = null;
    this.page = null;
    this.server = null;
    this.app = express();
    this.screenshotCounter = 0;
    this.analysisHistory = [];
    this.groqAnalyzer = new UniversalGroqAnalyzer();
    
    // Setup express server
    this.setupServer();
  }

  setupServer() {
    this.app.use(express.json());
    this.app.use(express.static('experimental/wasm')); // Serve static files
    
    // API endpoints
    this.app.get('/api/status', (req, res) => {
      res.json({
        status: 'running',
        url: this.url,
        port: this.port,
        screenshots: this.screenshotCounter,
        analyses: this.analysisHistory.length
      });
    });

    this.app.get('/api/screenshot', async (req, res) => {
      try {
        const result = await this.takeScreenshot();
        res.json({ success: true, filepath: result.filepath, filename: result.filename });
      } catch (error) {
        res.json({ success: false, error: error.message });
      }
    });

    this.app.post('/api/analyze', async (req, res) => {
      try {
        const { prompt, preset } = req.body;
        const analysis = await this.analyzeScreenshot(prompt, preset);
        res.json({ 
          success: true, 
          analysis: analysis.analysis,
          filepath: analysis.imagePath,
          timestamp: analysis.timestamp
        });
      } catch (error) {
        res.json({ success: false, error: error.message });
      }
    });

    this.app.get('/api/console', async (req, res) => {
      try {
        const logs = await this.getConsoleLogs();
        res.json({ success: true, logs });
      } catch (error) {
        res.json({ success: false, error: error.message });
      }
    });

    this.app.post('/api/action', async (req, res) => {
      try {
        const { action, selector, text, options } = req.body;
        const result = await this.performAction(action, selector, text, options);
        res.json({ success: true, result });
      } catch (error) {
        res.json({ success: false, error: error.message });
      }
    });

    // Serve the control interface
    this.app.get('/', (req, res) => {
      res.send(this.getControlInterfaceHTML());
    });
  }

  getControlInterfaceHTML() {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Interactive Puppeteer Automator</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .card { background: white; padding: 20px; margin: 10px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .status { background: #e8f5e8; border-left: 4px solid #4caf50; }
        .error { background: #ffeaea; border-left: 4px solid #f44336; }
        .success { background: #e8f5e8; border-left: 4px solid #4caf50; }
        button { background: #2196f3; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; margin: 5px; }
        button:hover { background: #1976d2; }
        button.danger { background: #f44336; }
        button.danger:hover { background: #d32f2f; }
        textarea { width: 100%; height: 100px; margin: 10px 0; }
        .screenshot { max-width: 100%; border: 1px solid #ddd; margin: 10px 0; }
        .log { background: #f5f5f5; padding: 10px; border-radius: 4px; font-family: monospace; white-space: pre-wrap; max-height: 300px; overflow-y: auto; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        @media (max-width: 768px) { .grid { grid-template-columns: 1fr; } }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎯 Interactive Puppeteer Automator</h1>
        
        <div class="card status">
            <h3>Status</h3>
            <div id="status">Loading...</div>
            <button onclick="refreshStatus()">Refresh Status</button>
        </div>

        <div class="grid">
            <div class="card">
                <h3>📸 Screenshot & Analysis</h3>
                <button onclick="takeScreenshot()">Take Screenshot</button>
                <button onclick="analyzeWithGroq()">Analyze with Groq</button>
                <div id="screenshot-container"></div>
            </div>

            <div class="card">
                <h3>🔍 Groq Vision Analysis</h3>
                <select id="analysis-preset">
                    <option value="">Custom Prompt</option>
                    <option value="ui-elements">UI Elements</option>
                    <option value="screenshot-analysis">Screenshot Analysis</option>
                    <option value="attractor-colors">Attractor Colors</option>
                    <option value="mathematical-patterns">Mathematical Patterns</option>
                </select>
                <textarea id="analysis-prompt" placeholder="Enter custom analysis prompt..."></textarea>
                <button onclick="analyzeWithGroq()">Analyze</button>
                <div id="analysis-result"></div>
            </div>
        </div>

        <div class="grid">
            <div class="card">
                <h3>🎮 Puppeteer Actions</h3>
                <select id="action-type">
                    <option value="click">Click Element</option>
                    <option value="type">Type Text</option>
                    <option value="evaluate">Evaluate JavaScript</option>
                    <option value="wait">Wait for Element</option>
                    <option value="navigate">Navigate</option>
                </select>
                <input type="text" id="action-selector" placeholder="CSS Selector or URL" style="width: 100%; margin: 5px 0;">
                <input type="text" id="action-text" placeholder="Text to type (for type action)" style="width: 100%; margin: 5px 0;">
                <button onclick="performAction()">Perform Action</button>
                <div id="action-result"></div>
            </div>

            <div class="card">
                <h3>📝 Console Logs</h3>
                <button onclick="getConsoleLogs()">Get Console Logs</button>
                <div id="console-logs" class="log"></div>
            </div>
        </div>

        <div class="card">
            <h3>📊 Analysis History</h3>
            <div id="analysis-history"></div>
        </div>
    </div>

    <script>
        let currentScreenshot = null;

        async function refreshStatus() {
            try {
                const response = await fetch('/api/status');
                const data = await response.json();
                document.getElementById('status').innerHTML = \`
                    <strong>URL:</strong> \${data.url}<br>
                    <strong>Port:</strong> \${data.port}<br>
                    <strong>Screenshots:</strong> \${data.screenshots}<br>
                    <strong>Analyses:</strong> \${data.analyses}
                \`;
            } catch (error) {
                document.getElementById('status').innerHTML = \`Error: \${error.message}\`;
            }
        }

        async function takeScreenshot() {
            try {
                const response = await fetch('/api/screenshot');
                const data = await response.json();
                
                if (data.success) {
                    currentScreenshot = data.screenshot;
                    document.getElementById('screenshot-container').innerHTML = \`
                        <img src="data:image/png;base64,\${data.screenshot}" class="screenshot" alt="Screenshot">
                        <p>Screenshot taken successfully!</p>
                    \`;
                    showResult('screenshot-container', 'success', 'Screenshot captured!');
                } else {
                    showResult('screenshot-container', 'error', \`Error: \${data.error}\`);
                }
            } catch (error) {
                showResult('screenshot-container', 'error', \`Error: \${error.message}\`);
            }
        }

        async function analyzeWithGroq() {
            if (!currentScreenshot) {
                showResult('analysis-result', 'error', 'Please take a screenshot first!');
                return;
            }

            const preset = document.getElementById('analysis-preset').value;
            const prompt = document.getElementById('analysis-prompt').value;

            if (!preset && !prompt) {
                showResult('analysis-result', 'error', 'Please select a preset or enter a custom prompt!');
                return;
            }

            try {
                const response = await fetch('/api/analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ preset, prompt })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    document.getElementById('analysis-result').innerHTML = \`
                        <div class="success">
                            <h4>Analysis Result:</h4>
                            <p>\${data.analysis.results.analysis}</p>
                            <small>Model: \${data.analysis.results.model}</small>
                        </div>
                    \`;
                } else {
                    showResult('analysis-result', 'error', \`Error: \${data.error}\`);
                }
            } catch (error) {
                showResult('analysis-result', 'error', \`Error: \${error.message}\`);
            }
        }

        async function performAction() {
            const action = document.getElementById('action-type').value;
            const selector = document.getElementById('action-selector').value;
            const text = document.getElementById('action-text').value;

            if (!selector) {
                showResult('action-result', 'error', 'Please provide a selector!');
                return;
            }

            try {
                const response = await fetch('/api/action', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action, selector, text })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    showResult('action-result', 'success', \`Action completed: \${JSON.stringify(data.result)}\`);
                } else {
                    showResult('action-result', 'error', \`Error: \${data.error}\`);
                }
            } catch (error) {
                showResult('action-result', 'error', \`Error: \${error.message}\`);
            }
        }

        async function getConsoleLogs() {
            try {
                const response = await fetch('/api/console');
                const data = await response.json();
                
                if (data.success) {
                    document.getElementById('console-logs').textContent = 
                        data.logs.map(log => \`[\${log.type}] \${log.text}\`).join('\\n');
                } else {
                    document.getElementById('console-logs').textContent = \`Error: \${data.error}\`;
                }
            } catch (error) {
                document.getElementById('console-logs').textContent = \`Error: \${error.message}\`;
            }
        }

        function showResult(elementId, type, message) {
            const element = document.getElementById(elementId);
            element.innerHTML = \`<div class="\${type}">\${message}</div>\`;
        }

        // Initialize
        refreshStatus();
    </script>
</body>
</html>`;
  }

  async start() {
    console.log('🚀 Starting Interactive Puppeteer Automator...');
    
    // Start browser with nix-shell compatibility and session persistence
    const browserOptions = {
      headless: false, // Show browser for debugging
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--allow-file-access-from-files',
        '--disable-web-security',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--keep-alive-for-test'
      ],
      // Keep browser alive even when no pages are open
      ignoreDefaultArgs: ['--disable-extensions'],
      handleSIGINT: false, // Don't close on Ctrl+C
      handleSIGTERM: false
    };
    
    // Use system Chromium from nix-shell if available (same pattern as existing scripts)
    const chromiumPath = process.env.PUPPETEER_EXECUTABLE_PATH || '/nix/store/hg1ralccfffgzqzpi2spwb1pgbbxfxnb-chromium-140.0.7339.207/bin/chromium';
    if (require('fs').existsSync(chromiumPath)) {
      browserOptions.executablePath = chromiumPath;
      console.log(`🌐 Using system Chromium: ${browserOptions.executablePath}`);
    } else {
      console.log(`⚠️  Chromium not found at: ${chromiumPath}`);
      console.log(`   Environment PUPPETEER_EXECUTABLE_PATH: ${process.env.PUPPETEER_EXECUTABLE_PATH}`);
    }
    
    this.browser = await puppeteer.launch(browserOptions);

    this.page = await this.browser.newPage();
    
    // Setup console logging and error handling
    this.page.on('console', msg => {
      console.log(`[CONSOLE ${msg.type().toUpperCase()}] ${msg.text()}`);
    });

    // Handle page crashes and keep session alive
    this.page.on('error', error => {
      console.log(`[PAGE ERROR] ${error.message}`);
    });

    this.page.on('pageerror', error => {
      console.log(`[PAGE ERROR] ${error.message}`);
    });

    // Keep page alive
    this.page.on('disconnected', () => {
      console.log('⚠️  Page disconnected, attempting to reconnect...');
      this.reconnectPage();
    });

    // Navigate to target
    const fullUrl = this.url.startsWith('http') ? this.url : 
                   path.resolve(process.cwd(), this.url);
    
    console.log(`📱 Navigating to: ${fullUrl}`);
    await this.page.goto(`file://${fullUrl}`, { waitUntil: 'networkidle0' });

    // Start web server
    this.server = this.app.listen(this.port, () => {
      console.log(`🌐 Control interface available at: http://localhost:${this.port}`);
      console.log(`🎯 Target URL: ${fullUrl}`);
      console.log('');
      console.log('🎮 Available commands:');
      console.log('  - Open http://localhost:' + this.port + ' for web interface');
      console.log('  - Press Ctrl+C to stop');
      console.log('  - Use REPL mode (coming next!)');
    });

    return this;
  }

  async reconnectPage() {
    try {
      console.log('🔄 Reconnecting page...');
      this.page = await this.browser.newPage();
      
      // Setup event handlers again
      this.page.on('console', msg => {
        console.log(`[CONSOLE ${msg.type().toUpperCase()}] ${msg.text()}`);
      });
      
      this.page.on('error', error => {
        console.log(`[PAGE ERROR] ${error.message}`);
      });
      
      this.page.on('pageerror', error => {
        console.log(`[PAGE ERROR] ${error.message}`);
      });
      
      this.page.on('disconnected', () => {
        console.log('⚠️  Page disconnected again, attempting to reconnect...');
        this.reconnectPage();
      });
      
      // Navigate back to target
      const fullUrl = this.url.startsWith('http') ? this.url : 
                     path.resolve(process.cwd(), this.url);
      await this.page.goto(`file://${fullUrl}`, { waitUntil: 'networkidle0' });
      console.log('✅ Page reconnected successfully');
    } catch (error) {
      console.log(`❌ Failed to reconnect page: ${error.message}`);
    }
  }

  async takeScreenshot() {
    if (!this.page) {
      console.log('⚠️  Page not available, attempting to reconnect...');
      await this.reconnectPage();
      if (!this.page) throw new Error('Could not initialize page');
    }
    
    try {
      const screenshot = await this.page.screenshot({ 
        encoding: 'base64',
        fullPage: true 
      });
      
      this.screenshotCounter++;
      
    // Save screenshot to file
    const filename = `screenshot_${Date.now()}_${this.screenshotCounter}.png`;
    const filepath = path.join(process.cwd(), 'screenshots', 'automator', filename);
    
    // Ensure directory exists
    await fs.mkdir(path.dirname(filepath), { recursive: true });
    
    // Save file
    await fs.writeFile(filepath, screenshot, 'base64');
    
    console.log(`📸 Screenshot saved: ${filepath}`);
    
    return { filepath, filename };
    } catch (error) {
      console.log(`❌ Screenshot failed: ${error.message}`);
      // Try to reconnect and retry once
      await this.reconnectPage();
      if (this.page) {
        const screenshot = await this.page.screenshot({ 
          encoding: 'base64',
          fullPage: true 
        });
        this.screenshotCounter++;
        const filename = `screenshot_${Date.now()}_${this.screenshotCounter}.png`;
        const filepath = path.join(process.cwd(), 'screenshots', 'automator', filename);
        await fs.mkdir(path.dirname(filepath), { recursive: true });
        await fs.writeFile(filepath, screenshot, 'base64');
        console.log(`📸 Screenshot saved after reconnect: ${filepath}`);
        return { filepath, filename };
      }
      throw error;
    }
  }

  async analyzeScreenshot(prompt, preset) {
    if (!this.page) throw new Error('Page not initialized');
    
    // Take fresh screenshot
    const screenshotResult = await this.takeScreenshot();
    
    // Use Groq analyzer on the saved screenshot
    let analysisPrompt = prompt;
    if (preset && PRESET_PROMPTS[preset]) {
      analysisPrompt = PRESET_PROMPTS[preset];
    }
    
    const analysis = await this.groqAnalyzer.analyzeWithPersistence(screenshotResult.filepath, analysisPrompt, { force: false });
    
    // Store in history
    this.analysisHistory.push({
      timestamp: new Date().toISOString(),
      prompt,
      preset,
      analysis,
      screenshot: screenshotResult.filename
    });
    
    console.log(`🔍 Analysis completed: ${analysis.analysis.substring(0, 100)}...`);
    
    return analysis;
  }

  async getConsoleLogs() {
    if (!this.page) throw new Error('Page not initialized');
    
    return await this.page.evaluate(() => {
      return window.consoleLogs || [];
    });
  }

  async performAction(action, selector, text, options = {}) {
    if (!this.page) {
      console.log('⚠️  Page not available, attempting to reconnect...');
      await this.reconnectPage();
      if (!this.page) throw new Error('Could not initialize page');
    }
    
    try {
      switch (action) {
        case 'click':
          await this.page.click(selector);
          return { action: 'click', selector };
          
        case 'type':
          await this.page.type(selector, text, options);
          return { action: 'type', selector, text };
          
        case 'evaluate':
          const result = await this.page.evaluate(text);
          return { action: 'evaluate', code: text, result };
          
        case 'wait':
          await this.page.waitForSelector(selector);
          return { action: 'wait', selector };
          
        case 'navigate':
          await this.page.goto(selector);
          return { action: 'navigate', url: selector };
          
        default:
          throw new Error(`Unknown action: ${action}`);
      }
    } catch (error) {
      console.log(`❌ Action failed: ${error.message}`);
      // Try to reconnect and retry once
      await this.reconnectPage();
      if (this.page) {
        switch (action) {
          case 'click':
            await this.page.click(selector);
            return { action: 'click', selector };
          case 'type':
            await this.page.type(selector, text, options);
            return { action: 'type', selector, text };
          case 'evaluate':
            const result = await this.page.evaluate(text);
            return { action: 'evaluate', code: text, result };
          case 'wait':
            await this.page.waitForSelector(selector);
            return { action: 'wait', selector };
          case 'navigate':
            await this.page.goto(selector);
            return { action: 'navigate', url: selector };
        }
      }
      throw error;
    }
  }

  async startREPL() {
    console.log('🎮 Starting REPL mode...');
    console.log('Available commands:');
    console.log('  - screenshot() - Take a screenshot');
    console.log('  - analyze(prompt, preset) - Analyze current page');
    console.log('  - click(selector) - Click an element');
    console.log('  - type(selector, text) - Type text into an element');
    console.log('  - evaluate(code) - Run JavaScript code');
    console.log('  - wait(selector) - Wait for an element');
    console.log('  - navigate(url) - Navigate to URL');
    console.log('  - logs() - Get console logs');
    console.log('  - help() - Show this help');
    console.log('');

    // Start Node.js REPL
    const repl = require('repl');
    const replServer = repl.start({
      prompt: 'puppeteer> ',
      useGlobal: true
    });

    // Make methods available in REPL
    replServer.context.screenshot = () => this.takeScreenshot();
    replServer.context.analyze = (prompt, preset) => this.analyzeScreenshot(prompt, preset);
    replServer.context.click = (selector) => this.performAction('click', selector);
    replServer.context.type = (selector, text) => this.performAction('type', selector, text);
    replServer.context.evaluate = (code) => this.performAction('evaluate', null, code);
    replServer.context.wait = (selector) => this.performAction('wait', selector);
    replServer.context.navigate = (url) => this.performAction('navigate', url);
    replServer.context.logs = () => this.getConsoleLogs();
    replServer.context.help = () => {
      console.log('Available commands:');
      console.log('  screenshot(), analyze(prompt, preset), click(selector), type(selector, text)');
      console.log('  evaluate(code), wait(selector), navigate(url), logs(), help()');
    };

    return replServer;
  }

  async stop() {
    console.log('🛑 Stopping Interactive Puppeteer Automator...');
    
    if (this.server) {
      this.server.close();
    }
    
    if (this.browser) {
      await this.browser.close();
    }
    
    console.log('✅ Stopped successfully');
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const url = args[0] || 'experimental/wasm/index.html';
  const port = parseInt(args[1]) || 3000;

  console.log('🎯 Interactive Puppeteer Automator');
  console.log(`📱 Target: ${url}`);
  console.log(`🌐 Port: ${port}`);
  console.log('');

  const automator = new InteractivePuppeteerAutomator({ url, port });
  
  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\\n🛑 Shutting down...');
    await automator.stop();
    process.exit(0);
  });

  try {
    await automator.start();
    
    // Wait for user input to start REPL
    console.log('Press Enter to start REPL mode, or Ctrl+C to stop...');
    
    process.stdin.once('data', async () => {
      await automator.startREPL();
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await automator.stop();
    process.exit(1);
  }
}

// Export for programmatic use
module.exports = InteractivePuppeteerAutomator;

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}
