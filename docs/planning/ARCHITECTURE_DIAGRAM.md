# 🏗️ Architecture Diagram - Unified Quaternion Attractor

**Date:** January 5, 2025  
**Status:** Design Phase

---

## 📊 **Current Architecture (Problems)**

```
┌─────────────────────────────────────────────────────────────────┐
│                        CURRENT STATE                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  src/typescript/core/          legacy2/src/typescript/core/     │
│  ├── attractor-engine.ts       ├── attractor-wrapper.ts         │
│  ├── js-engine.ts              ├── types.ts                     │
│  └── types.ts                  └── wasm-loader.ts               │
│                                                                 │
│  src/typescript/node/          legacy2/src/wasm/                │
│  ├── image-renderer.ts         ├── attractor-engine.ts          │
│  └── groq-vision-analyzer.ts   ├── quaternion-math.ts           │
│                                 └── deterministic-random.ts     │
│                                                                 │
│  ❌ DUPLICATED CODE:                                            │
│  • Types defined in multiple places                            │
│  • Math functions reimplemented                                │
│  • Configuration systems differ                                │
│  • No unified interface                                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 **Proposed Architecture (Solution)**

```
┌─────────────────────────────────────────────────────────────────┐
│                      UNIFIED ARCHITECTURE                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                 SHARED CORE LAYER                       │   │
│  │                                                         │   │
│  │  src/shared/                                           │   │
│  │  ├── types/           ├── math/        ├── config/     │   │
│  │  │   ├── attractor.ts │   ├── quat.ts  │   ├── builder │   │
│  │  │   ├── engine.ts    │   ├── proj.ts  │   ├── presets │   │
│  │  │   └── render.ts    │   └── valid.ts │   └── valid.ts │   │
│  │  └── utils/                                               │   │
│  │      ├── random.ts    ├── perf.ts      ├── memory.ts   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                 ENGINE LAYER                            │   │
│  │                                                         │   │
│  │  src/engines/                                          │   │
│  │  ├── base/             ├── typescript/  ├── webasm/    │   │
│  │  │   ├── abstract.ts   │   ├── js.ts    │   ├── wasm.ts │   │
│  │  │   ├── factory.ts    │   └── perf.ts  │   ├── loader  │   │
│  │  │   └── registry.ts   │                │   └── memory  │   │
│  │  └── hybrid/                                               │   │
│  │      ├── adaptive.ts   ├── monitor.ts   ├── switch.ts  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                RENDERING LAYER                          │   │
│  │                                                         │   │
│  │  src/rendering/                                        │   │
│  │  ├── base/             ├── png/        ├── webgl/      │   │
│  │  │   ├── abstract.ts   │   ├── core.ts │   ├── render  │   │
│  │  │   └── factory.ts    │   ├── node.ts │   └── shaders │   │
│  │  └── svg/                  └── canvas.ts                │   │
│  │      └── render.ts                                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                ADAPTER LAYER                            │   │
│  │                                                         │   │
│  │  src/adapters/                                         │   │
│  │  ├── browser/          ├── node/       ├── worker/     │   │
│  │  │   ├── engine.ts     │   ├── engine  │   ├── engine  │   │
│  │  │   ├── renderer.ts   │   ├── file.ts │   └── msg.ts  │   │
│  │  │   └── dom.ts        │   └── cli.ts  │               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 **Data Flow Architecture**

```
┌─────────────────────────────────────────────────────────────────┐
│                        DATA FLOW                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  User Input → Configuration → Engine Selection → Point Generation │
│      ↓              ↓              ↓              ↓             │
│  ┌─────────┐   ┌──────────┐   ┌──────────┐   ┌─────────────┐   │
│  │ Browser │   │ Config   │   │ Engine   │   │ Attractor   │   │
│  │   UI    │ → │ Builder  │ → │ Factory  │ → │   Engine    │   │
│  └─────────┘   └──────────┘   └──────────┘   └─────────────┘   │
│      ↓              ↓              ↓              ↓             │
│  ┌─────────┐   ┌──────────┐   ┌──────────┐   ┌─────────────┐   │
│  │ Node.js │   │ Presets  │   │ Registry │   │   Points    │   │
│  │   CLI   │   │ System   │   │ System   │   │  Generated  │   │
│  └─────────┘   └──────────┘   └──────────┘   └─────────────┘   │
│      ↓              ↓              ↓              ↓             │
│  ┌─────────┐   ┌──────────┐   ┌──────────┐   ┌─────────────┐   │
│  │ Web     │   │ Validation│   │ Capability│   │ Rendering  │   │
│  │ Worker  │   │ System   │   │ Detection │   │ Pipeline   │   │
│  └─────────┘   └──────────┘   └──────────┘   └─────────────┘   │
│      ↓              ↓              ↓              ↓             │
│  Output ← Renderer Selection ← Platform Detection ← Point Data  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 **Engine Selection Logic**

```
┌─────────────────────────────────────────────────────────────────┐
│                    ENGINE SELECTION FLOW                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Start → Environment Detection → Capability Check → Engine Choice │
│    ↓              ↓                    ↓              ↓         │
│  ┌─────┐      ┌─────────────┐      ┌─────────────┐  ┌─────────┐ │
│  │ App │  →   │ Browser?    │  →   │ WASM        │  │ WASM    │ │
│  │ Init│      │ Node.js?    │      │ Support?    │  │ Engine  │ │
│  └─────┘      │ Worker?     │      │ Performance │  └─────────┘ │
│    ↓          └─────────────┘      │ Good?       │      ↓      │
│  ┌─────┐           ↓               └─────────────┘  ┌─────────┐ │
│  │ User│      ┌─────────────┐           ↓           │ JS      │ │
│  │ Pref│  →   │ Platform    │      ┌─────────────┐  │ Engine  │ │
│  │ Set │      │ Detection   │  →   │ Fallback    │  └─────────┘ │
│  └─────┘      └─────────────┘      │ Required?   │      ↓      │
│    ↓              ↓                └─────────────┘  ┌─────────┐ │
│  ┌─────┐      ┌─────────────┐           ↓           │ Hybrid  │ │
│  │ Perf│  →   │ Capability  │      ┌─────────────┐  │ Engine  │ │
│  │ Req │      │ Assessment  │  →   │ Adaptive    │  └─────────┘ │
│  └─────┘      └─────────────┘      │ Selection?  │             │
│                                     └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 **Build System Architecture**

```
┌─────────────────────────────────────────────────────────────────┐
│                      BUILD SYSTEM                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Source Code → TypeScript Compilation → Platform Bundling      │
│      ↓              ↓                        ↓                 │
│  ┌─────────┐   ┌─────────────┐         ┌─────────────┐         │
│  │ Shared  │   │ TS Compiler │    →    │ Browser     │         │
│  │ Core    │ → │ (tsc)       │         │ Bundle      │         │
│  └─────────┘   └─────────────┘         │ (Webpack)   │         │
│      ↓              ↓                  └─────────────┘         │
│  ┌─────────┐   ┌─────────────┐              ↓                  │
│  │ Engines │   │ Assembly    │         ┌─────────────┐         │
│  │ Layer   │ → │ Script      │    →    │ Node.js     │         │
│  └─────────┘   │ (asc)       │         │ Bundle      │         │
│      ↓         └─────────────┘         │ (tsc)       │         │
│  ┌─────────┐         ↓                 └─────────────┘         │
│  │ Render  │   ┌─────────────┐              ↓                  │
│  │ Layer   │ → │ WASM        │         ┌─────────────┐         │
│  └─────────┘   │ Compilation │    →    │ Worker      │         │
│      ↓         └─────────────┘         │ Bundle      │         │
│  ┌─────────┐         ↓                 │ (Webpack)   │         │
│  │ Adapter │   ┌─────────────┐         └─────────────┘         │
│  │ Layer   │ → │ Type        │                                 │
│  └─────────┘   │ Generation  │                                 │
│                └─────────────┘                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 **Benefits Visualization**

```
┌─────────────────────────────────────────────────────────────────┐
│                        BENEFITS                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  BEFORE (Current)                    AFTER (Proposed)           │
│  ┌─────────────────────┐            ┌─────────────────────┐     │
│  │ Code Duplication    │            │ Shared Components   │     │
│  │ • 60% duplicated    │     →      │ • <10% duplicated   │     │
│  │ • Inconsistent APIs │            │ • Unified APIs      │     │
│  │ • Multiple types    │            │ • Single type system│     │
│  └─────────────────────┘            └─────────────────────┘     │
│                                                                 │
│  ┌─────────────────────┐            ┌─────────────────────┐     │
│  │ Build Issues        │            │ Unified Build       │     │
│  │ • ES module errors  │     →      │ • Multi-platform    │     │
│  │ • Browser problems  │            │ • Optimized bundles │     │
│  │ • Manual bundling   │            │ • Automated builds  │     │
│  └─────────────────────┘            └─────────────────────┘     │
│                                                                 │
│  ┌─────────────────────┐            ┌─────────────────────┐     │
│  │ Maintenance         │            │ Easy Maintenance    │     │
│  │ • Multiple codebases│     →      │ • Single codebase   │     │
│  │ • Inconsistent bugs │            │ • Consistent fixes  │     │
│  │ • Hard to extend    │            │ • Easy to extend    │     │
│  └─────────────────────┘            └─────────────────────┘     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 **Migration Path**

```
┌─────────────────────────────────────────────────────────────────┐
│                      MIGRATION TIMELINE                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Week 1: Foundation          Week 2: Engine Integration        │
│  ┌─────────────────────┐    ┌─────────────────────┐            │
│  │ • Shared Types      │    │ • Base Engine       │            │
│  │ • Math Functions    │ →  │ • TS Engine Refactor│            │
│  │ • Configuration     │    │ • WASM Integration  │            │
│  │ • Utilities         │    │ • Engine Registry   │            │
│  └─────────────────────┘    └─────────────────────┘            │
│                                                                 │
│  Week 3: Rendering            Week 4: Build System             │
│  ┌─────────────────────┐    ┌─────────────────────┐            │
│  │ • Abstract Renderer │    │ • Build Config      │            │
│  │ • PNG Refactor      │ →  │ • Browser Bundling  │            │
│  │ • Platform Adapters │    │ • Testing & Docs    │            │
│  │ • Integration       │    │ • Migration Tools   │            │
│  └─────────────────────┘    └─────────────────────┘            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

*This architecture diagram provides a visual representation of the current problems and the proposed unified solution, showing how the new architecture eliminates code duplication and creates a maintainable, scalable system.*
