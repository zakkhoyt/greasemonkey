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