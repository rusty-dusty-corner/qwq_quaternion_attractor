{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = with pkgs; [
    # Node.js and npm
    nodejs
    nodePackages.npm
    
    # Puppeteer dependencies
    chromium
    firefox
    
    # Development tools
    git
    curl
    wget
    
    # Build tools for native modules
    python3
    gcc
    gnumake
    
    # WebAssembly tools
    binaryen
    
    # Image processing libraries (for canvas support)
    cairo
    cairo.dev
    pango
    pango.dev
    libjpeg
    giflib
    librsvg
    librsvg.dev
    pixman
    
    # Additional system libraries
    glib
    glib.dev
    gdk-pixbuf
    gdk-pixbuf.dev
    atk
    atk.dev
    gtk3
    gtk3.dev
    
    # AssemblyScript compiler (install via npm in the shell)
    # nodePackages.assemblyscript
  ];

  # Environment variables for Puppeteer
  shellHook = ''
    # Set Chromium path for Puppeteer
    export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1
    export PUPPETEER_EXECUTABLE_PATH=${pkgs.chromium}/bin/chromium
    
    # Set Firefox path for Playwright (alternative)
    export PLAYWRIGHT_BROWSERS_PATH=${pkgs.firefox}/bin/firefox
    
    # Node.js environment
    export NODE_PATH=$PWD/node_modules:$NODE_PATH
    
    # Canvas library paths
    export PKG_CONFIG_PATH="${pkgs.cairo.dev}/lib/pkgconfig:${pkgs.pango.dev}/lib/pkgconfig:${pkgs.libjpeg}/lib/pkgconfig:${pkgs.giflib}/lib/pkgconfig:${pkgs.librsvg.dev}/lib/pkgconfig:${pkgs.pixman}/lib/pkgconfig:${pkgs.glib.dev}/lib/pkgconfig:${pkgs.gtk3.dev}/lib/pkgconfig"
    export PKG_CONFIG_LIBDIR=$PKG_CONFIG_PATH
    
    # Additional environment for canvas compilation
    export CPPFLAGS="-I${pkgs.cairo.dev}/include -I${pkgs.pango.dev}/include -I${pkgs.pixman}/include"
    export LDFLAGS="-L${pkgs.cairo}/lib -L${pkgs.pango}/lib -L${pkgs.pixman}/lib"
    
    # Install AssemblyScript locally if not already installed
    if [ ! -d "node_modules/.bin/asc" ] && [ ! -f "node_modules/.bin/asc" ]; then
      echo "📦 Installing AssemblyScript locally..."
      npm install --save-dev assemblyscript
    fi
    
    # Development environment setup
    echo "🚀 Nix shell environment ready!"
    echo "📦 Node.js version: $(node --version)"
    echo "🔧 npm version: $(npm --version)"
    echo "🌐 Chromium path: $PUPPETEER_EXECUTABLE_PATH"
    if [ -f "node_modules/.bin/asc" ]; then
      echo "🔧 AssemblyScript version: $(./node_modules/.bin/asc --version)"
    fi
    echo ""
    echo "Available commands:"
    echo "  npm install          - Install project dependencies"
    echo "  npm run build:wasm   - Build WebAssembly module"
    echo "  npm test            - Run tests with Puppeteer"
    echo "  node examples/...   - Run examples"
    echo ""
    echo "💡 Puppeteer is configured to use system Chromium"
    echo "💡 All native dependencies are available"
  '';
  
  # Enable network access for npm installs
  NIX_SHELL_ALLOW_NETWORK = 1;
}
