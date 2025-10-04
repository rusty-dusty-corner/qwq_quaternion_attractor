/**
 * WASM Module Loader
 * 
 * Handles loading and initialization of WebAssembly modules
 * across different platforms (browser and Node.js)
 */

import { WasmModule } from './types';

export class WasmLoader {
  private module: WasmModule | null = null;
  private isLoaded = false;
  
  /**
   * Load WASM module
   */
  async load(): Promise<WasmModule> {
    if (this.isLoaded && this.module) {
      return this.module;
    }
    
    try {
      // Try browser environment first
      if (typeof window !== 'undefined') {
        this.module = await this.loadBrowser();
      } 
      // Try Node.js environment
      else if (typeof require !== 'undefined') {
        this.module = await this.loadNode();
      }
      // Fallback: try dynamic import
      else {
        this.module = await this.loadDynamic();
      }
      
      this.isLoaded = true;
      return this.module;
    } catch (error) {
      throw new Error(`Failed to load WASM module: ${error}`);
    }
  }
  
  /**
   * Load WASM module in browser environment
   */
  private async loadBrowser(): Promise<WasmModule> {
    // In browser, we expect the WASM module to be served statically
    const wasmUrl = '/wasm/math-engine.wasm';
    const jsUrl = '/wasm/math-engine.js';
    
    try {
      // Load the JavaScript wrapper
      const module = await import(jsUrl);
      
      // Initialize WASM if needed
      if (module.default && typeof module.default === 'function') {
        const wasmModule = await module.default();
        return wasmModule as WasmModule;
      }
      
      return module as WasmModule;
    } catch (error) {
      throw new Error(`Browser WASM loading failed: ${error}`);
    }
  }
  
  /**
   * Load WASM module in Node.js environment
   */
  private async loadNode(): Promise<WasmModule> {
    try {
      // In Node.js, we can use require or import
      const module = await import('../wasm/math-engine.js');
      
      // Node.js WASM loading
      if (module.default && typeof module.default === 'function') {
        const wasmModule = await module.default();
        return wasmModule as WasmModule;
      }
      
      return module as WasmModule;
    } catch (error) {
      throw new Error(`Node.js WASM loading failed: ${error}`);
    }
  }
  
  /**
   * Load WASM module using dynamic import
   */
  private async loadDynamic(): Promise<WasmModule> {
    try {
      // Try to dynamically import the WASM module
      const module = await import('../wasm/math-engine.js');
      return module as WasmModule;
    } catch (error) {
      throw new Error(`Dynamic WASM loading failed: ${error}`);
    }
  }
  
  /**
   * Check if WASM is loaded
   */
  isWasmLoaded(): boolean {
    return this.isLoaded && this.module !== null;
  }
  
  /**
   * Get loaded module (throws if not loaded)
   */
  getModule(): WasmModule {
    if (!this.isLoaded || !this.module) {
      throw new Error('WASM module not loaded. Call load() first.');
    }
    return this.module;
  }
  
  /**
   * Unload WASM module
   */
  unload(): void {
    if (this.module) {
      // Clean up any resources if needed
      this.module = null;
      this.isLoaded = false;
    }
  }
}

// Singleton instance
export const wasmLoader = new WasmLoader();
