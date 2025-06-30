# About

This repository contains a series of scripts for Greasemonky, Violentmonkey, etc... Each nested in a subfolder. 


You can edit/debug the source using Greasemonky's IDE, etc... This works but manually saving and reloading the web page stinks. 


# Violentmonkey
![edit_violent_monkey](images/edit_violent_monkey.png)


``` sh
# # An easy/recommended http-server for debugging javascripts
# brew install http-server

# Launch the server with a 5 second cache
http-server -c5

# Same as ^, but opens browser to this source file (which you'll want open anyhow)
http-server -c5 -o amazon_item_blocker/amazon_sponsor.user.js
```

Once the source is open in your browser, change these settings:

![external_editor_reload](images/external_editor_reload.png)



# Debugging

* To use breakpoints, insert the line `debugger;` which is like a programmatic breakpoint.
* Open your browser debugger then reload the page. You should hit the breakpoint. 
* Inspect elements and properties using breakpoint


![firefox_debugger_breakpoint](images/firefox_debugger_breakpoint.png)



# Questions

## Preferences/Settings
* [ ] Can we read/write preferences?
  * [ ] Where is the data stored?
* [ ] How can we make settings page for a script?
  * [ ] violentmonkey support?
  * [ ] custom UI 


## Element Interactions

### Buttons
* [X] ~~*How to add a button to an element?*~~ [2025-06-30] 
  * EX: Click on the button to copy markdow to clipboard
* [ ] How to copy an existing button (to clone the appearance, etc..)
* [ ] How to control layout?

References
* [Create an HTML button programmatically](https://sebhastian.com/javascript-create-button/)
* [Mozilla Clipboard Reference](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/write#write_text_to_the_clipboard)


### On click event
* [write to clipboard onclick](https://www.w3schools.com/howto/howto_js_copy_clipboard.asp)
* [X] ~~*Can we detect modifier keys when clicking?*~~ [2025-06-30]
  * [mozilla ref](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/getModifierState)
  * [mozilla keyboard event](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent)
* [ ] Can we detect normal keys when clicking?
* [ ] How about straight up hotkeys?

### Read/Write to OS Clipboard
* [ ] can we write to os clipboard? 
  * EX: Copy data as markdown
  * [Write to clipboard on click (HTML example)](https://www.w3schools.com/howto/howto_js_copy_clipboard.asp)
  * [Mozilla Reference](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/write#write_text_to_the_clipboard)

### Read/Write to filesystem
* [ ] can a script write a text file to the file system?

### Context Menu (right click)




