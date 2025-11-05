



Create a violentmonkey script that can create a markdown link from any HTML anchor (`<a>`) in the web page with varying title data sources. 

Script filepath: `/Users/zakkhoyt/code/repositories/z2k/github/greasemonkey/markdown_linker/markdown_linker.js` (there is minor boilerplate there now.)



Both the html anchor (`<a href=$url>title</a>`) and the markdown link (`[title]($url)`) are composed with
* a `url`: any `https://...` and a few other schemes like `ftp://`, `file://`, `ssh://`, etc...
* a `title`: a human readable description

# Browser and Extension Support
* Initially I want this script to work for my personal setup: `macOS 26.1 Beta (25B5042k)`, `Firefox 144.0.2`, `violentmonkey 2.31.0`

# Script inputs
The script will need at least 2 pieces of input data: A `URL` and a `title`

## URL
For the URL I would like to support both:
* Any HTML anchor displayed in the current web page
* The URL of the current web page 

## Title
For the title I'd like for the user to be able to specify from a few different data sources
* If the user has highlighted any text on the current web page, prefer that for the title. I"m not sure if that's possible, but let's check the violentmonkey API docs
* The value of the the HTML anchor. EX: `<a href="https://....">MY TITLE</a>`
* Ideally the user could right click (aka context click) on any HTML anchor then trigger the script there. Aslo would liek to be able to use URL of the current web page as a data source


# Invoking the Script
For the script input case of HTML anchors, the user needs to be able to specify. Ideally I'd like the user to be able to right click on an anchor then select "Create Markdown Link" (possibly with a submenu to specify what to use for the title). 

For the script input case of using the current webpage's URL. Again, ideally right clicking on the page in general (not on an anchor) could contain a similar menu (possibly with a submenu to specify what to use for the title). 


## Fallbacks
I'm not sure if this browser context menu idea is possible within the security limitations of Firefox and ViolentMonkey. Please check the documentation of both. 

Preferences
1) Browser Context Menu 
2) HTML popup menu of some sort (maybe `cmd+click`, `opt+click` or something like that. Some key/mouse combo that's not already taken
3) A sibling HTML element. We could add a button or something before/after/above/below each anchor on the page. This is lease desirable for a number of reasons

## Current Firefox Behavior
Currently when I right click on an anchor in firefox, this is the context menu that I see (no `violentmonkey` stuff in here).
![Firefox_anchor_context_menu](images/Firefox_anchor_context_menu.png)



# Script Output
Now that the script has both pieces of input, it's easy to create a markdown link, 

Always print the output/markdown to the console logs like so (in a single log call)
1. title 
2. html anchor 
3. markdown output


How should the script hand that markdown link over to the user?

1. To start with let's write it to the system's pasteboard/clipboard. I'm quite certian that violentmonkey has an API for this. 


# Other
The starting script has a ViolentMonkey header, but I think the sytnax is pretty dated (based off of an old example). Let's update this to replace any deprecated our outdated syntax. Ask me


# Scripting References
* Find other scripts to use as references `/Users/zakkhoyt/code/repositories/z2k/github/greasemonkey/**/*.js`

# References
Read / mine these web pages for documentation (and any others you see fit)
* [violentmonkey](https://violentmonkey.github.io/)
* [GitHub: violentmonkey](https://github.com/violentmonkey/violentmonkey)
* [violentmonkey scripts](https://github.com/ja-ka/violentmonkey)
* [Using Modern JS Syntax](https://violentmonkey.github.io/guide/using-modern-syntax/)
* [Violentmonkey (GM functions)](https://violentmonkey.github.io/api/gm/)




Please summarize the plan and ask me to confirm, fill in details, etc... Ask me questions along the way if things are unclear or if there are alternate possibilities. 


--- 

Add logging throughout. `trace` style.

# Formatting
* put back let logBase = "MD_URL".
* prefex every console write logBase. EX: console.log('${logBase}: begin script');
  * perhaps a wrapper function is appropriate?

# Occurrence
* first line of each function (begin $function_name)
* last line of each function (end $function_name)
* before each "task". EX: "Will read clipboard"
* after each "task". Include task output if convenient. EX: "Did read clipboard: 'abc123'"


Summarize before updating

---

Add succinct comments throughout. Format the comments for the perspective of a seasoned developer who is learning javascript, html, and violent as tertiary languages. Include references to documentation where applicable (javascript, html, violentmonkey, css, and firefox)

Prefer `mozilla` documentation where available and sufficient, but fall back to other vendors as appropriate. 
* [html example](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/details#creating_an_open_disclosure_box)
* [javascript example](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)


Action Items
* Add a header comment (after `// ==/UserScript==`) 
* Add a function comment to each function in the file
* Anywhere else that could be tricky, or works around some problem, there is a lesson to be learned, etc...
```






---




# Secondary Goals
* [X] ~~*clean up the url. Extract info from script to form a full URL if javascript is involved. Avoid redirects.*~~ [2025-11-01] 
* [X] ~~*URL shortening (esp amazong)*~~ [2025-11-01]
* [X] ~~*all on page (indented)*~~ [2025-11-01]
* [X] ~~*all on page (outdented)*~~ [2025-11-01]

econdary Goals

* [X] ~~*if our isDebug flag == true, when writing each console log also write it to some local file, on disk, where you have access to read it.*~~ [2025-11-02] 
    * Be sure to use proper timestamping for each log line. 
    * We could even write a new log file each session (timestamped of course)
    * Maybe `/tmp/userscripts/markdown_linker/logs/markdown_linker_${timestamp}.log`
* [X] ~~*let's make `opt+z+click` (either on a anchor or off of a anchor) to automatically infer the title in this order:*~~ [2025-11-03]
    * selected text
    * anchor title

* [X] ~~*For the opt+z+click scenario, I'd like some visualt feedback  on each click. Like a little click animation*~~ [2025-11-03]
* [ ] success banner should preview the output (1 line truncated)
* [ ] let's add a preference (using violentmonkey API) to let the user define their own "key shortcuts"
    * use the current as default values
    * let the user type in the keyboard short cut keys for both functions
* [ ] let's add a preference (using violentmonkey API) for popup menu scaling. 
    * allow a value from 0.5 ... 3.0
    * The default value should be 1.0. and 1.0 should equal the current css & size setttings 
    * the preference value should be some factor to apply to those css values
    * If we can use a slider that would probably be ideal, but we can work with other UI controls as well

    * hotkey modifier


* [ ] dedicated hotkey to infer title source (no menu prompt)
    * selected text -> anchor title

* [ ] image links (click only)
* [ ] hotkey glyphs in menu
* [ ] normalize list indenting
* [ ] filtering nonsense urls
* [ ] additional title dataSource: Infer from url
    * domain: last path component (sentence case)
    * github specific
* [ ] inputs: add "From Clipboard" if the clipboard has appropriate content
* [ ] output format (single, list)

* [ ] After the implementation goals are met, it would be nice if this script could work for similar extensions (like `greasemonkey`), more browsers, etc...





# amazon

There are few things to address regarding amazon. Before getting into details I dug up some documentations and reference code regarding amazon URLS
* I've added some notes about amazon URL anatomy, etc..: Please read all files here: `docs/notes/amazon/*`
* I've also added some useful amazon url breakdown/composition code under: `docs/references/amazon_fetch/**/*`
* lastly there might be some useful amazon url related code under: `amazon_item_blocker/**/*`

## Shorter Link Titles for amazon
* shorter titles for amazon products. The titles are much longer than I'd like
    * Remove things like: ' at Amazon Women’s Clothing store'
    
EX:
* URL: https://www.amazon.com/Xiaoxuemeng-Elastic-Waisted-Palazzo-Coffee-S/dp/B0DFB9X382/?_encoding=UTF8&content-id=amzn1.sym.cd409af6-99ed-4f1e-ade0-2d3b4623bec0&th=1&psc=1
* current result: [Xiaoxuemeng Womens Baggy Wide Leg Pants Casual Elastic Waisted Palazzo Harem Pants with Pockets(Coffee-S) at Amazon Women’s Clothing store](https://www.amazon.com/Xiaoxuemeng-Elastic-Waisted-Palazzo-Coffee-S/dp/B0DFB9X382/?_encoding=UTF8&content-id=amzn1.sym.cd409af6-99ed-4f1e-ade0-2d3b4623bec0&th=1&psc=1)
* a bit shorter: [Xiaoxuemeng Womens Baggy Wide Leg Pants Casual Elastic Waisted Palazzo Harem Pants with Pockets(Coffee-S)](https://www.amazon.com/Xiaoxuemeng-Elastic-Waisted-Palazzo-Coffee-S/dp/B0DFB9X382/?_encoding=UTF8&content-id=amzn1.sym.cd409af6-99ed-4f1e-ade0-2d3b4623bec0&th=1&psc=1)
* even shorter: [Xiaoxuemeng Womens Baggy Wide Leg Pants (Coffee-S)](https://www.amazon.com/Xiaoxuemeng-Elastic-Waisted-Palazzo-Coffee-S/dp/B0DFB9X382/?_encoding=UTF8&content-id=amzn1.sym.cd409af6-99ed-4f1e-ade0-2d3b4623bec0&th=1&psc=1)


## amazon urls can be shorter
The URLS that this script is generating are 
EX: 
* This url was output by the current userscript : https://www.amazon.com/Xiaoxuemeng-Elastic-Waisted-Palazzo-Coffee-S/dp/B0DFB9X382/?_encoding=UTF8&content-id=amzn1.sym.cd409af6-99ed-4f1e-ade0-2d3b4623bec0&th=1&psc=1
* IT can def be shortened to this: https://www.amazon.com/dp/B0DFB9X382?_encoding=UTF8&content-id=amzn1.sym.cd409af6-99ed-4f1e-ade0-2d3b4623bec0&th=1&psc=1


## More specific urls / query parameters for amazon
* When taking link for the current page on amazon sites, products that have color selection, size selection, etc.. the URL doesn't seem to reflect that. We do want to remove tracker information and all unecessary query params, but  we also want to keep size/color type query params. 

EX: 
Maybe this example doesn't actually have different query parameters. 
* URL: https://www.amazon.com/Xiaoxuemeng-Elastic-Waisted-Palazzo-Coffee-S/dp/B0DFB9X382/?_encoding=UTF8&content-id=amzn1.sym.cd409af6-99ed-4f1e-ade0-2d3b4623bec0&th=1&psc=1
* coffee, x-small: [Xiaoxuemeng Womens Baggy Wide Leg Pants Casual Elastic Waisted Palazzo Harem Pants with Pockets(Coffee-S) at Amazon Women’s Clothing store](https://www.amazon.com/Xiaoxuemeng-Elastic-Waisted-Palazzo-Coffee-S/dp/B0DJ75BM9M/?_encoding=UTF8&content-id=amzn1.sym.cd409af6-99ed-4f1e-ade0-2d3b4623bec0&th=1&psc=1)
* beige, large:    [Xiaoxuemeng Womens Baggy Wide Leg Pants Casual Elastic Waisted Palazzo Harem Pants with Pockets(Coffee-S) at Amazon Women’s Clothing store](https://www.amazon.com/Xiaoxuemeng-Elastic-Waisted-Palazzo-Coffee-S/dp/B0DYNQ33HB/?_encoding=UTF8&content-id=amzn1.sym.cd409af6-99ed-4f1e-ade0-2d3b4623bec0&th=1&psc=1)


## Other. 

It might be worth starting to build an amazon_url type class/file at this point since the script is getting pretty big and these changes are just for amazon. 

---

Let's pause here for a moment and do some work in `docs/notes/amazon/AMAZON_URL_QUERY_PARAMETERS.md`. For each list item in `# Mined query parameters`, provide a defintion for what the query parameter means. Consult amazon docs and also coding / hacking websites. I found I had to look at both 


Do not delete any list items, only add definitions to them (along with a reference link where you found the data. )

---
Next, let's create a 3rd markdown document in that directory about how to scrape product, variant, and image data from the HTML source code of a product. 

Basically detail what this javascript file does: `docs/references/amazon_url_miner_node/amazon_tools.js`, 
but also keep in mind the two *.md files that we just wrote based off of research (`docs/notes/amazon_url/*.md`)


BTW this script is what calls `amazon_tools.js`, but it's not very relevant:`docs/references/amazon_url_miner_node/fetch_html.js`

After reading all of those files, write a 3rd file under `docs/notes/amazon_url` that details how to: 
* generate a markdown link to that product
    * title: How to scrape and prepare a title for the link that is succinct yet still descriptive
        * several data sources for the title
    * url: 
        * How to build a product URL that is as short as possible 
        * how to retain product variant selection in the URL (size, color, etc..)
* generate a markdown image link to an image of that product product
    * How to find/scrape the image identifier (not the same as ASIN)
    * how to compose an image URL
    * how to create variants of the image url (different sizes for example)
* Any other functions or procedures not mentioned here. 


One more ask: Please research if there are other/supported/easier ways to do things that `amazon_tools.js` does. If so, let's discuss first. 

Ask me any question along the way. Summarize before writing. 

--- ---
BTW I ran into some rate limiting problems while developing amazon_tools.js, so it would be good to note that. Doing things like retaining the source code (vs re-fetching would be helpful)


---

# Amazon Toolkit
Let's explore building a reusable "amazon toolkit" (meaning a class / library / framework). 
IE: a piece of code that that has a simplified public interface and which encasuplates the complexityies and implementation details. 

Ideally we implement this "amazon toolkit", then we can update our userscript to consume it later. 

## Convention
This "toolkit" should follow our AI instructions for userscripts (`.github/instructions/userscript-conventions.instructions.md`) even if it might be general javascript file. 
* re-read our AI instructions for userscript at `.github/instructions/userscript-conventions.instructions.md`, then apply it to this "toolkit" 

## Compatibility
This "toolkit" should be consumable from userscript, javascript, and node scripts (ideally all of these). 
* IE: let's write it with compaitble tools (whicih I think is already covered in `docs/notes/amazon_url/AMAZON_PRODUCT_SCRAPING_GUIDE.md`)

## Interface

This "toolkit" should have public APIs for:
* everything that `docs/references/amazon_fetch/amazon_tools2.js` can do
* everything outlined in `docs/notes/amazon_url/AMAZON_PRODUCT_SCRAPING_GUIDE.md`
* everyhing amazon related in `markdown_linker/markdown_linker.user.js`


## DataSources & References
This "toolkit" should use all of our dataSources (*md, *.js, *.userscript.js) and all of our learnings from above in this thread. 

### *.md
Re-read the legacy markdown docs
Our older markdown files (moved to a new subdirectory): 
* docs/notes/amazon/coding/AMAZON_IMAGE_URL_ANATOMY.md
* docs/notes/amazon/coding/AMAZON_SCRATCHPAD.md
* docs/notes/amazon/coding/AMAZON_URL_ANATOMY.md
* docs/notes/amazon/coding/AMAZON_URL_MINED_QUERY_PARAMETERS.md

Re-read the 3 markdown docs that were created eariler in this thread, prefereing this as a data source where there are conflicts with the above
* docs/notes/amazon_url/AMAZON_PRODUCT_SCRAPING_GUIDE.md
* docs/notes/amazon_url/AMAZON_URL_REFERENCE.md
* docs/notes/amazon_url/AMAZON_IMAGE_URL_REFERENCE.md

An re-read these scripts (which will be updated to use this "amazon toolkit" in the near future)
* `docs/references/amazon_fetch/amazon_tools2.js`
* `markdown_linker/markdown_linker.user.js`

## Implementation
* The implementaiton doesn't need to be called "amazon toolkit"; Choose a name that follows typical JavaScript conventions
* Write the new "amazon toolkit" files under the newly created dir: `amazon_toolkit/**`, which you can rename to reflect ^.
* Do not simply copy/paste the code from existing scripts as that code may not be compaitble, may be buggy, and does not follow the conventions outlined in AI instructions.  
    * Analyze each dataSource (listed below), ensure that all code conforms to the AI instructions. 

* DO NOT modify any other files during this phase, only write our new toolkit code and (if helpful) a markdown to reflect what's done and what's left to do. 
### NameSpaces
I think it is wise to design this "toolkit" with what I'm going to call namespaces. Here is very rough idea. 
* amazon_toolkit/product_extractor
* amazon_toolkit/store_extractor
* amazon_toolkit/url_toolbox - funtions that take in data structs from:
    * product_extractor
    * store_extractor
    * html anchors (this refers what we currently do in "opt+z+click" on anchor)

let's explore this idea. Ask me questions

---

<!-- I mentioned this eariler, but let's consider building an amazon toolkit (a class maybe?). 

* This amazon toolkit file shoudl follow all instructions defined in `.github/instructions/userscript-conventions.instructions.md` (read it in full, then apply during write)
* Should be a separate/importable file that we can use from `markdown_linker.user.js` (don't modify that file at this time) and from other userscripts in the future. 
* Refactor the amazon utilities found in `docs/references/amazon_url_miner_node/amazon_tools.js`, 
* Add functions to cover the amazon related stuff from our user scirpt. 

The public API should have support for everything amazon related in both of these current scripts:
* `docs/references/amazon_url_miner_node/amazon_tools.js`
* `markdown_linker/markdown_linker.user.js`

Let's stirctkly focus on creating that amazon toolkit. Do not modify these files right now. Do read them though. 
* `docs/references/amazon_url_miner_node/amazon_tools.js`
* `markdown_linker/markdown_linker.user.js`
* any other pre-exising *.js file
Do not simply copy/paste the code. Analyze each piece, rewrite it according to the AI instructions. 
 -->





---

1. sure, let's start with that. Though there will be more shortening to do later
2. `/dp/{ASIN}` or one of the other 2 bare formats according to `## Product URLs` in `docs/notes/amazon/AMAZON_URL_ANATOMY.md`. 


---


I was expecting that these files would contain classes (or most of them would). 
* Is there a reasoning behind using just a loose collection of functions? 
* What would consumer code look like? Are these function nested under some namespace when they are called? 
Let's discuss the pros/cons of such an architecture. 
* how does public/internal/private scoping work here? I didn't see any of those keywords used. Are they not supported?

Let's discuss writing tests for the amazon and userscript_common libraries. I can provide raw product source code (as files). 
* What else would you need from me? 
* how to structure tests for this kind of environment?
* what does the dir hierarchy look like?

I do have some more things to talk about but lets' cover these two first. 


why is `function extractASIN(doc, url)` in shared_extractor? (and similar question for other product related functions) It's product releated and I would think goes in product_extractor (maybe I'm wrong and it's )
 If these functions remain in share_extractor the I ask that you be more specific with function names. Here are a few examples:
    * function extractASIN(doc, url) -> function extractProductASIN(doc, url)
    * function extractTitle(doc) -> function extractProductTitle(doc)
    * function extractBrand(doc) -> function extractProductBrand(doc)
In fact update functions names in all cases where the filename isn't descriptive enough


* I feel like `dom_helpers.js` and `logging_helpers.js` are not amazon specific and could be very useful for future userscripts that are written in this repo (since AI instruction will always call for these thing). We should move these to their own "library". I already made a directory for it: `userscript_common`

--- 

I'd prefer that test reside in in the same folder as what they are testing (vs all tests gatherd together under the same dir) > What are some pros/cons?