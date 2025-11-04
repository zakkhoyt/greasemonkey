# AI Instructions Setup - Userscript Conventions

## Summary

Successfully added comprehensive AI instructions and logging infrastructure for ViolentMonkey userscripts.

## What Was Created

### 1. `.github/instructions/userscript-conventions.instructions.md`

A complete instruction file for ViolentMonkey userscript development covering:

- **Script Structure & Metadata**: Proper metadata block format, header comments
- **Logging Architecture**: Core functions (`log()`, `logFunctionBegin()`, `logFunctionEnd()`, `logWarn()`, `logError()`)
- **Debug Control**: Using `isDebug` flag to enable/disable trace logging
- **Function Documentation**: JSDoc requirements, inline comments, type information
- **Type Annotations**: Parameter types, return types, union types with examples
- **References**: MDN documentation, ViolentMonkey API docs, browser standards
- **Best Practices**: Event handling, DOM manipulation, error handling, CSS animations
- **Console Log Management**: How to export and save console logs for AI review

**Key Features**:
- Matches formatting and structure of existing `.zsh-conventions.instructions.md`
- Provides concrete examples for each guideline
- Includes links to official documentation (MDN, ViolentMonkey)
- Applicable to `**/*.user.js` files

### 2. `.gitignored/logs/` Directory

Created a dedicated directory for browser console log exports:

- **Location**: `.gitignored/logs/`
- **Purpose**: Store exported browser console messages for AI agent review
- **Already in .gitignore**: Pattern `**/.gitignored/` already exists in repository
- **Includes README**: `.gitignored/logs/README.md` with detailed instructions

### 3. `.gitignored/logs/README.md`

Comprehensive guide for generating and saving console logs:

- Step-by-step instructions for exporting logs
- Naming convention: `$scriptname.log` (e.g., `markdown_linker.log`)
- Expected log format with timestamps
- How to request AI assistance with logs
- Debugging tips for effective log capture

## How to Use

### For Userscript Development

1. Follow conventions in `.github/instructions/userscript-conventions.instructions.md`
2. Use the logging functions in your scripts
3. Set `isDebug = true` during development to see trace logs
4. Set `isDebug = false` before committing

### For AI-Assisted Debugging

1. In browser console, right-click and select "Save all Messages to File"
2. Save to `.gitignored/logs/$scriptname.log` (e.g., `.gitignored/logs/markdown_linker.log`)
3. Commit the log file (it's tracked for review, not for production)
4. Request AI assistance and reference the log file path
5. AI agent will review the console output to diagnose issues

## Example Workflow

### Development and Testing
```bash
# Make changes to markdown_linker.user.js
# Set isDebug = true in script

# Test script in browser
# Browser console shows all trace logs

# Right-click console → "Save all Messages to File"
# Save to: .gitignored/logs/markdown_linker.log

# Request AI review:
# "I'm getting an issue with Alt+Z+Click animation. 
#  Please review the logs at .gitignored/logs/markdown_linker.log"
```

### Before Committing
```javascript
// Set debug flag to false
const isDebug = false;  // Disable trace logging for production

// Commit changes
// .gitignored/logs/markdown_linker.log is already in .gitignore
```

## Files Modified

- `.github/instructions/userscript-conventions.instructions.md` - **Created**
- `.gitignored/logs/README.md` - **Created**
- `docs/todo/UPDATE_AI_INSTRUCTIONS.md` - **Updated** to mark tasks complete

## Integration with Markdown Linker Script

The instruction file was designed specifically to match and document the patterns already used in `markdown_linker/markdown_linker.user.js`:

- ✅ Logging functions (`log`, `logFunctionBegin`, `logFunctionEnd`)
- ✅ isDebug flag for controlling trace output
- ✅ Comprehensive JSDoc comments
- ✅ Type annotations and references
- ✅ MDN and ViolentMonkey API documentation
- ✅ Proper metadata block format
- ✅ Click feedback animation with CSS keyframes

## Next Steps

1. **Existing Scripts**: Review other `.user.js` files and ensure they follow these conventions
2. **Script Testing**: When testing scripts, export console logs to `.gitignored/logs/` for better debugging
3. **New Scripts**: Use this instruction file as a template for new userscript development
4. **Branch Back**: Ready to return to `zakk/click_animation` branch for markdown_linker script

## Notes

- The linter shows false positives on the instruction file (markdown reference syntax, code blocks) - these are not actual errors
- `.gitignored/logs/` directory is properly excluded from Git via `.gitignore`
- Instructions can be extended in the future with additional guidance as new patterns emerge
