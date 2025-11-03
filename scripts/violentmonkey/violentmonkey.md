
# Open webpage (that the script affects), in a browser. 

Follow AI instructions

Towards the end of the script, find `# TODO: zakkhoyt P1 - Open webpage (that the script affects), in a browser.`. Replace this with the code to open the website in a browser: `open $url`. 

Lets' support this in a nummber of ways



## 1. From cli arguments
Add a new optional arg `--url <url>`
If --url was passed in, 

## 2. Imply form metadata
Read the meta lines from user.js looking for all lines that match:
* `// @match        <parse this>`
* `// @include      <parse this>`
Real examples
* `// @match        *://*/*`
* `// @include      *://*.github.com/*`

## 3. Prompt for it