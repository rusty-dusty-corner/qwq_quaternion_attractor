# 🔧 Nix Shell Setup Guide

Complete guide for setting up the Quaternion Attractor project using Nix for reproducible, dependency-free development.

## 🎯 Why Nix Shell?

This project uses nix-shell to solve several common development challenges:

- ✅ **No network dependencies** - All tools available offline
- ✅ **Reproducible environment** - Same setup on any machine
- ✅ **Dependency conflicts resolved** - Native libraries properly linked
- ✅ **Cross-platform compatibility** - Works on Linux, macOS, and NixOS
- ✅ **Version consistency** - Exact tool versions guaranteed

## 🚀 Quick Start

### Prerequisites

Install Nix package manager:

```bash
# Linux/macOS
curl --proto '=https' --tlsv1.2 -sSf -L https://install.deterministic.space/nix.sh | sh -s -- --no-daemon

# Or use your system package manager
# Ubuntu/Debian: sudo apt install nix
# Arch: sudo pacman -S nix
# macOS: brew install nix
```

### Enter Development Environment

```bash
# Clone the repository
git clone <repository-url>
cd qwq_quaternion_attractor

# Enter nix-shell (first time will download dependencies)
nix-shell

# You'll see this welcome message:
# 🚀 Nix shell environment ready!
# 📦 Node.js version: v22.19.0
# 🔧 npm version: 10.9.3
# 🌐 Chromium path: /nix/store/.../bin/chromium
# 🔧 AssemblyScript version: Version 0.27.37
```

## 🛠️ What's Included

The nix-shell provides a complete development environment:

### Core Tools
- **Node.js v22.19.0** - Latest stable JavaScript runtime
- **npm v10.9.3** - Package manager with full functionality
- **Git** - Version control system
- **Python 3.13.7** - For native module compilation
- **GCC** - C/C++ compiler for native dependencies

### WebAssembly Development
- **AssemblyScript** - TypeScript-like language for WebAssembly
- **Binaryen** - WebAssembly optimization and toolchain
- **WebAssembly tools** - `wasm-as`, `wasm-opt`, `wasm-dis`, etc.

### Browser Testing
- **Chromium** - Headless browser for Puppeteer testing
- **Firefox** - Alternative browser for Playwright

### Native Libraries
- **Cairo** - 2D graphics library for canvas support
- **Pango** - Text rendering library
- **libjpeg, giflib** - Image format support
- **librsvg** - SVG rendering
- **pixman** - Low-level pixel manipulation

## 📋 Available Commands

### Using `nix-shell --run`

Execute commands directly in the nix environment without entering interactive shell:

```bash
# Check environment
nix-shell --run "node --version && npm --version"

# Build WebAssembly
nix-shell --run "npm run build:wasm"

# Test WebAssembly functions
nix-shell --run "node test-wasm-simple.mjs"

# Test Puppeteer
nix-shell --run "node test-puppeteer.js"

# Complete workflow
nix-shell --run "npm install --legacy-peer-deps && npm run build:wasm && node test-wasm-simple.mjs"
```

### Interactive Development

```bash
# Enter nix-shell
nix-shell

# Now all commands run in the nix environment
npm install --legacy-peer-deps
npm run build:wasm
npm test
node examples/...
```

## 🔧 Environment Variables

The shell automatically sets these environment variables:

```bash
# Puppeteer configuration
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1
export PUPPETEER_EXECUTABLE_PATH=/nix/store/.../bin/chromium

# Node.js paths
export NODE_PATH=$PWD/node_modules:$NODE_PATH

# Native library compilation
export PKG_CONFIG_PATH=/nix/store/.../lib/pkgconfig:...
export CPPFLAGS=-I/nix/store/.../include
export LDFLAGS=-L/nix/store/.../lib
```

## 🧪 Testing Setup

### WebAssembly Testing

```bash
# Build and test WebAssembly module
nix-shell --run "npm run build:wasm && node test-wasm-simple.mjs"

# Expected output:
# 🧪 Testing WebAssembly module directly...
# ✅ WebAssembly binary loaded (655 bytes)
# ✅ WebAssembly module instantiated successfully
# 🔢 Testing mathematical functions...
#    add(5, 3) = 8
#    multiply(4, 2) = 8
#    factorial(5) = 120
#    square(3.5) = 12.25
#    simpleRandom(12345) = 12.345000267028809
# 🎉 All WebAssembly functions working correctly!
```

### Puppeteer Testing

```bash
# Test browser automation
nix-shell --run "node test-puppeteer.js"

# Expected output:
# 🧪 Testing Puppeteer in nix-shell environment...
# ✅ Browser launched successfully
# ✅ Page created successfully
# ✅ Navigation successful
# ✅ Content evaluation successful
# ✅ Screenshot captured (8906 bytes)
# 🎉 All tests passed! Puppeteer is working correctly in nix-shell.
```

## 🐛 Troubleshooting

### Problem: "asc: command not found"

```bash
# AssemblyScript should install automatically
# If not, check the shell hook in shell.nix
nix-shell --run "ls -la node_modules/.bin/asc"
```

### Problem: Canvas compilation fails

```bash
# The nix environment includes all native libraries
# Check if pkg-config finds them:
nix-shell --run "pkg-config --libs cairo pango"
```

### Problem: Puppeteer can't find Chromium

```bash
# Check environment variables
nix-shell --run "echo $PUPPETEER_EXECUTABLE_PATH && which chromium"
```

### Problem: WebAssembly compilation fails

```bash
# Check AssemblyScript installation
nix-shell --run "./node_modules/.bin/asc --version"

# Try simpler AssemblyScript code
nix-shell --run "echo 'export function add(a: i32, b: i32): i32 { return a + b; }' > test.ts && ./node_modules/.bin/asc test.ts -b test.wasm"
```

## 🔄 Alternative: direnv Integration

For automatic environment activation:

```bash
# Install direnv
nix-env -iA nixpkgs.direnv

# Allow direnv in project directory
direnv allow

# Now environment activates automatically when you cd into the project
cd /path/to/qwq_quaternion_attractor
# Environment is now active!
```

## 📚 Additional Resources

- [Nix Package Manager](https://nixos.org/) - Official documentation
- [nix-shell](https://nixos.org/manual/nix/stable/command-ref/nix-shell.html) - Shell environment documentation
- [AssemblyScript](https://www.assemblyscript.org/) - WebAssembly compiler documentation
- [Puppeteer](https://pptr.dev/) - Browser automation documentation

## 🎉 Success Indicators

You'll know the setup is working when you see:

1. ✅ **Nix-shell enters successfully** with welcome message
2. ✅ **WebAssembly compiles** without errors (`npm run build:wasm`)
3. ✅ **WebAssembly functions execute** correctly (`node test-wasm-simple.mjs`)
4. ✅ **Puppeteer launches browser** and takes screenshots (`node test-puppeteer.js`)
5. ✅ **All dependencies available** without network access

---

*This nix-shell setup ensures a completely reproducible development environment for the Quaternion Attractor project, eliminating the dependency issues mentioned in PROJECT_STATUS.md.*
