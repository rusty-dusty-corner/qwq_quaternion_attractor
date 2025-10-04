# 🚀 Nix Shell --run Examples

Here are practical examples of using `nix-shell --run` with your Quaternion Attractor project:

## 📦 Basic Environment Commands

```bash
# Check Node.js and npm versions
nix-shell --run "node --version && npm --version"

# Check Chromium availability for Puppeteer
nix-shell --run "which chromium && chromium --version"

# Check pkg-config setup
nix-shell --run "pkg-config --libs cairo pango"
```

## 🔧 Development Commands

```bash
# Clean install dependencies (when canvas issues are resolved)
nix-shell --run "rm -rf node_modules package-lock.json && npm install --legacy-peer-deps"

# Install AssemblyScript globally
nix-shell --run "npm install -g assemblyscript"

# Build WebAssembly module
nix-shell --run "npm run build:wasm"

# Run tests
nix-shell --run "npm test"
```

## 🧪 Testing Commands

```bash
# Test Puppeteer setup
nix-shell --run "node test-puppeteer.js"

# Run specific test files
nix-shell --run "npm run test:wasm"

# Run examples
nix-shell --run "npm run example:node"
```

## 📊 Project Status Commands

```bash
# Check project structure
nix-shell --run "ls -la src/ && ls -la build/"

# Verify WebAssembly compilation
nix-shell --run "ls -la build/math-engine.wasm"

# Check generated output files
nix-shell --run "ls -la output/"
```

## 🔄 Workflow Commands

```bash
# Complete build and test workflow
nix-shell --run "npm install --legacy-peer-deps && npm run build:wasm && npm test"

# Development cycle
nix-shell --run "npm run build:wasm && npm run example:node && ls -la output/"

# Clean and rebuild
nix-shell --run "rm -rf build/ node_modules/ && npm install --legacy-peer-deps && npm run build:wasm"
```

## 🎯 Alternative Canvas-Free Approach

Since canvas is causing issues, here's how to test without it:

```bash
# Install only non-canvas dependencies
nix-shell --run "npm install --legacy-peer-deps --ignore-scripts"

# Test WebAssembly compilation without canvas
nix-shell --run "npm run build:wasm"

# Test mathematical functions directly
nix-shell --run "node -e 'console.log(\"WASM test ready\")'"
```

## 🌐 Browser Testing Commands

```bash
# Test browser compatibility
nix-shell --run "node examples/browser-test.js"

# Generate test HTML
nix-shell --run "node examples/generate-test-html.js"

# Launch browser for manual testing
nix-shell --run "chromium examples/browser-example.html"
```

## 📈 Performance Testing

```bash
# Benchmark WebAssembly vs JavaScript
nix-shell --run "node tests/performance-benchmark.js"

# Memory usage testing
nix-shell --run "node tests/memory-test.js"

# Generate performance report
nix-shell --run "npm run benchmark && cat reports/performance.md"
```

## 🛠️ Troubleshooting Commands

```bash
# Check environment variables
nix-shell --run "env | grep -E '(PUPPETEER|PKG_CONFIG|NODE)'"

# Verify native libraries
nix-shell --run "pkg-config --list-all | grep -E '(cairo|pango|pixman)'"

# Check build tools
nix-shell --run "which gcc make python3"
```

## 🎨 Creative Commands

```bash
# Generate multiple attractor patterns
nix-shell --run "for i in {1..5}; do npm run generate -- --seed=$i --output=pattern-$i.png; done"

# Create animation frames
nix-shell --run "npm run animate -- --frames=60 --output=animation.gif"

# Batch process different parameters
nix-shell --run "npm run batch -- --config=batch-config.json"
```

## 🔍 Debugging Commands

```bash
# Verbose WebAssembly compilation
nix-shell --run "npm run build:wasm -- --verbose"

# Debug Puppeteer
nix-shell --run "node test-puppeteer.js --debug"

# Check WebAssembly module
nix-shell --run "wasm-objdump -h build/math-engine.wasm"
```

---

## 💡 Pro Tips

1. **Chain commands**: Use `&&` to run multiple commands in sequence
2. **Background processes**: Add `&` for long-running tasks
3. **Output redirection**: Use `>` to save output to files
4. **Environment isolation**: Each `--run` command gets a fresh environment
5. **Error handling**: Use `||` for fallback commands

Example:
```bash
nix-shell --run "npm install --legacy-peer-deps || echo 'Install failed, trying alternative approach'"
```
