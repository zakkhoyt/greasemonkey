



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
* [ ] let's make `opt+z+click` (either on a anchor or off of a anchor) to automatically infer the title in this order:
    * selected text
    * anchor title
* [ ] success banner should preview the output (1 line truncated)
* [ ] let's add a preference (using violentmonkey API) to let the user define their own "key shortcuts"
    * use the current as default values
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

