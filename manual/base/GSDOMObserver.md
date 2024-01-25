# GSDOMObserver class

GSDOMObserver class is a generic page DOM tree monitoring that monitors elements injection and removal from a web page.
 
GSDOMObserver allows you to register a custom filter / processing function for generic use.
 
For example, it is used to handle Bootstrap data-bs-* attributes instead of Bootstrap JavaScript code.
This allows us to do a modal popup, toggles, dismiss activities just as in Bootstrap.
 
It is required as Bootstrap JavaScript code is not supported across multiple Shadow DOM elements without individual loading Bootstrap JavaScript every time, which would affect memory and performance significantly.
 
Example below shows how to select **DIV** injected elements. Handler callback function will be called for every **DIV** element injected into a page.

```
const filter = (el) => { return el.tagName ==='DIV'; };
const handler = (el) => { console.log(el); }

GSDOMObserver.registerFilter(filter, handler);
```

<br>

&copy; Green Screens Ltd. 2016 - 2024
