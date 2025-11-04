
* ✅ add instructions file for userscripts: `.github/instructions/userscript-conventions.instructions.md` that applies to `**/*.user.js`
  * File created with comprehensive ViolentMonkey development conventions
  * Includes logging architecture, function documentation, type annotations, and best practices
* ✅ The AI agent has no access to the browser console logs, unfortunately. As a solution the user can right click in the console -> `Save all Messages to File`. The user should save these under `.gitignored/logs/$userscript_basename.log`
  * Directory `.gitignored/logs/` created with README explaining the process
  * Already included in `.gitignore` via `**/.gitignored/` pattern
  * AI agent instructions to follow: After user reports testing issues, request log file path and review the saved console output 

