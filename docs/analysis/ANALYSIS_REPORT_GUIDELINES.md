# Analysis Report Guidelines

**Purpose:** Standardized guidelines for creating comprehensive and reproducible analysis reports.

## Required Image Path Documentation

### **CRITICAL:** Always include full paths to images in analysis reports

Every analysis report MUST include complete file paths to all referenced images. This ensures:
- **Reproducibility:** Anyone can find and analyze the same images
- **Traceability:** Clear connection between analysis and source data
- **Efficiency:** No time wasted searching for files

## Image Path Format

### Absolute Paths (Preferred for reports):
```
/home/eugenejukov/git/hobby/qwq_quaternion_attractor/output/mass_generation/2025-10-05T16-19-57-373Z/mass_0935_flip_smallest_simple_9071pts.png
```

### Relative Paths (Acceptable for documentation):
```
output/mass_generation/2025-10-05T16-19-57-373Z/mass_0935_flip_smallest_simple_9071pts.png
```

## Standard Report Structure

### 1. Header Information
```markdown
**Date:** YYYY-MM-DD  
**Report ID:** XXXX  
**Type:** [Analysis Type]  
**Status:** [Complete/In Progress/Draft]  
```

### 2. Executive Summary
- Brief overview of findings
- Key metrics and results
- Main conclusions

### 3. Methodology Section
```markdown
## Methodology

### Data Sources
- **Generation Method:** [uniform/mass/random]
- **Total Images:** [number]
- **Time Period:** [date range]
- **Tools Used:** [list of tools]

### Analysis Tools
- **Groq Vision:** [model used, prompts]
- **Statistical Analysis:** [methods used]
- **Comparison Methods:** [how comparisons were made]

### Image Paths
**Base Directory:** `/home/eugenejukov/git/hobby/qwq_quaternion_attractor/output/`

**Image Collections:**
- **Mass Generation:** `output/mass_generation/[timestamp]/`
- **Uniform Generation:** `output/uniform_mass_generation/[timestamp]/`
- **Test Images:** `output/test_[purpose]/[timestamp]/`
```

### 4. Analysis Results
For each image or comparison:

```markdown
### Sample [ID]: [Descriptive Name]

**Image Path:** `output/[generation_type]/[timestamp]/[filename].png`
**Parameter File:** `output/[generation_type]/[timestamp]/[filename]_params.json`

**Analysis Results:**
- **Visual Interest Rating:** X/10
- **Key Characteristics:** [list]
- **Mathematical Patterns:** [description]
- **Color Distribution:** [description]

**Groq Vision Analysis:**
[Full analysis text here]
```

### 5. Conclusions
- Summary of findings
- Implications for future work
- Recommendations

## Required Information for Each Image

### Minimum Required:
1. **Full file path** to image
2. **Full file path** to parameter file (if available)
3. **Generation timestamp** or session identifier
4. **Generation method** used
5. **Analysis results** (ratings, descriptions)

### Recommended Additional:
1. **File size** and **dimensions**
2. **Generation parameters** (key values)
3. **Analysis timestamp**
4. **Tool version** used
5. **Comparison references**

## Path Discovery Commands

### Find images by pattern:
```bash
find output -name "*mass_0935*" -type f
find output -name "*uniform_0057*" -type f
```

### List generation sessions:
```bash
ls output/mass_generation/
ls output/uniform_mass_generation/
```

### Find parameter files:
```bash
find output -name "*_params.json" -type f
```

## Example Report Section

```markdown
### Comparison 1: Flip Smallest Mode

**Images Compared:**

**Previous Generation:**
- **Image Path:** `output/mass_generation/2025-10-05T16-19-57-373Z/mass_0935_flip_smallest_simple_9071pts.png`
- **Parameter Path:** `output/mass_generation/2025-10-05T16-19-57-373Z/mass_0935_flip_smallest_simple_9071pts_params.json`
- **Generation Session:** 2025-10-05T16-19-57-373Z
- **Method:** Mass generation with random parameters

**Current Generation:**
- **Image Path:** `output/uniform_mass_generation/2025-10-06T04-10-40-279Z/uniform_0057_flip_smallest_simple_7353pts.png`
- **Parameter Path:** `output/uniform_mass_generation/2025-10-06T04-10-40-279Z/uniform_0057_flip_smallest_simple_7353pts_params.json`
- **Generation Session:** 2025-10-06T04-10-40-279Z
- **Method:** Uniform generation with systematic sampling

**Analysis Results:**
[Analysis content here]
```

## Quality Checklist

Before finalizing any analysis report:

- [ ] All image paths are complete and accurate
- [ ] Parameter file paths are included where available
- [ ] Generation timestamps are documented
- [ ] Analysis tools and versions are specified
- [ ] File paths can be verified with `find` commands
- [ ] Relative paths are consistent with project structure
- [ ] No orphaned references to missing files

## Common Path Patterns

### Mass Generation:
```
output/mass_generation/[YYYY-MM-DDTHH-MM-SS-sssZ]/mass_[XXXX]_[mode]_[projection]_[points]pts.png
```

### Uniform Generation:
```
output/uniform_mass_generation/[YYYY-MM-DDTHH-MM-SS-sssZ]/uniform_[XXXX]_[mode]_[projection]_[points]pts.png
```

### Test Images:
```
output/test_[purpose]/[YYYY-MM-DDTHH-MM-SS-sssZ]/[descriptive_name].png
```

## Best Practices

1. **Always include full paths** in the first reference to each image
2. **Use consistent path formatting** throughout the report
3. **Verify paths exist** before finalizing the report
4. **Include generation context** (timestamp, method, session)
5. **Document any path changes** if files are moved
6. **Use descriptive names** for custom test images

---

**Remember:** The goal is to make every analysis report completely reproducible and traceable. Anyone should be able to find and analyze the exact same images using the information in the report.
