# Parameter Database

**Purpose:** Systematic collection and documentation of quaternion attractor parameters and their visual characteristics.

## Structure

Each sample is organized in its own directory with a descriptive name:

```
docs/analysis/parameter_database/
├── README.md (this file)
├── pending_analysis/
│   └── pending_images_YYYY-MM-DD.md
├── sample_001_organized_fractal_tree/
│   ├── parameters.json
│   └── description.md
├── sample_002_vibrant_fractal_galaxy/
│   └── description.md
├── uniform_mass_generation_analysis_YYYY-MM-DD.md
└── ...
```

## Naming Convention

### Sample Directory Names:
- Format: `sample_XXX_descriptive_name`
- XXX: Three-digit sequential number
- descriptive_name: Snake_case description of visual characteristics

### Examples:
- `sample_001_organized_fractal_tree`
- `sample_002_dense_neural_network`
- `sample_003_spiral_galaxy_pattern`
- `sample_004_chaotic_scattered_points`

## File Contents

### parameters.json
Complete parameter set used to generate the image:
- Attractor constants (start, wind, additive)
- Render parameters (mode, projection, camera rotation)
- Image settings (size, scale, blur)
- Generation metadata (timestamp, tool used)

### description.md
Detailed visual and mathematical description:
- Visual characteristics
- Mathematical patterns
- Fractal properties
- Color distribution
- Geometric structures
- Groq Vision analysis (if available)
- Interesting observations
- Potential variations to explore

## Usage

This database serves multiple purposes:

1. **Parameter Space Exploration:** Track which parameter combinations produce interesting results
2. **Pattern Recognition:** Identify common characteristics of successful parameters
3. **Reproducibility:** Easy regeneration of specific visual patterns
4. **Research:** Build understanding of parameter-to-visual relationships
5. **Optimization:** Guide future parameter generation strategies

## Pending Analysis

The `pending_analysis/` folder contains images waiting for Groq Vision analysis:

- **Purpose:** Buffer for images that need AI analysis when API is available
- **Format:** `pending_images_YYYY-MM-DD.md`
- **Contents:** Image paths, parameters, analysis commands, and status tracking
- **Usage:** Run provided analysis commands when Groq API is available

### Current Pending Items:
- Images with API capacity issues (503 errors)
- Images requiring retry after temporary failures
- High-priority images for immediate analysis

## Contributing

When adding new samples:

1. Generate image with interesting visual characteristics
2. If Groq analysis fails, add to `pending_analysis/` folder
3. Create new directory with descriptive name once analyzed
4. Save complete parameter set as `parameters.json`
5. Write detailed description in `description.md`
6. Update this README with any new patterns or insights

## Analysis Tools

Use these tools to analyze the database:

```bash
# Regenerate image from parameters
npm run regenerate:single path/to/parameters.json

# Analyze image with Groq Vision
node tools/universal-groq-analyzer.js analyze image.png "Describe the mathematical patterns"

# Compare similar samples
node tools/universal-groq-analyzer.js compare img1.png img2.png "Compare these patterns"
```
