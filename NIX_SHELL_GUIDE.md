# 🔧 Nix Shell Setup for Quaternion Attractor Project

This guide explains how to use the nix-shell environment to resolve dependency issues and enable Puppeteer testing.

## 🚀 Quick Start

### Option 1: Using nix-shell directly
```bash
# Enter the nix-shell environment
nix-shell

# You'll see the environment setup message
# Now you can run npm commands
npm install
npm run build:wasm
npm test
```

### Option 2: Using direnv (recommended)
```bash
# Install direnv (if not already installed)
nix-env -iA nixpkgs.direnv

# Allow direnv in this directory
direnv allow

# Now the environment activates automatically when you enter the directory
cd /path/to/project
# Environment is now active!
```

## 🛠️ What's Included

The nix-shell provides:

- **Node.js & npm** - Latest stable versions
- **Chromium** - For Puppeteer headless browser testing
- **Firefox** - Alternative browser for Playwright
- **Development tools** - Git, curl, wget, Python, GCC, make
- **Image libraries** - Cairo, Pango, libjpeg, etc. for canvas support
- **AssemblyScript** - WebAssembly compiler

## 🧪 Testing the Setup

After entering nix-shell, test that Puppeteer works:

```bash
# Install Puppeteer
npm install puppeteer

# Test the setup
node test-puppeteer.js
```

You should see:
```
🧪 Testing Puppeteer in nix-shell environment...
🚀 Launching Chromium...
✅ Browser launched successfully
📄 Creating new page...
✅ Page created successfully
🌐 Testing navigation...
✅ Navigation successful
🔍 Testing content evaluation...
✅ Content evaluation successful
📸 Testing screenshot capability...
✅ Screenshot captured (1234 bytes)
✅ Browser closed successfully

🎉 All tests passed! Puppeteer is working correctly in nix-shell.
```

## 🔧 Environment Variables

The shell automatically sets these environment variables:

- `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1` - Use system Chromium
- `PUPPETEER_EXECUTABLE_PATH` - Points to nix-provided Chromium
- `NODE_PATH` - Includes local node_modules
- `PKG_CONFIG_PATH` - For native library linking

## 🐛 Troubleshooting

### Problem: "Chromium not found"
```bash
# Check if Chromium is available
which chromium
echo $PUPPETEER_EXECUTABLE_PATH

# Re-enter nix-shell if needed
exit
nix-shell
```

### Problem: "npm install fails"
```bash
# Try with legacy peer deps
npm install --legacy-peer-deps

# Or clean install
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Problem: "Canvas library not found"
The nix-shell includes all necessary native libraries. If you still have issues:
```bash
# Check if libraries are available
pkg-config --libs cairo pango

# Re-enter nix-shell
exit
nix-shell
```

## 🎯 Next Steps

Once the nix-shell environment is working:

1. **Install dependencies**: `npm install --legacy-peer-deps`
2. **Build WebAssembly**: `npm run build:wasm`
3. **Run tests**: `npm test`
4. **Generate examples**: `npm run example:node`

## 📚 Additional Resources

- [Nix Package Manager](https://nixos.org/)
- [direnv](https://direnv.net/) - Automatic environment switching
- [Puppeteer Documentation](https://pptr.dev/)
- [AssemblyScript Documentation](https://www.assemblyscript.org/)

---

*This setup resolves the network connectivity issues mentioned in PROJECT_STATUS.md by providing all dependencies through Nix, ensuring consistent and reproducible development environments.*
