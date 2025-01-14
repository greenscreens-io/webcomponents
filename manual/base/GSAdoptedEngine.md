# GSAdoptedEngine Class
 
 GSAdoptedEngine is responsible to monitor and apply style and stylesheet changes to the component addoptableStyleSheet.
 
Monitor HTMLStyleElement & HTMLLinkElement (of type stylesheet) for changes. Every such element marked with data-adoptable="true" will be cached 
and will trigger "gs-adopted" event to notify component controller [AdoptedController](../controllers/AdoptedController.md) to update
adoptableStyleSheet list on conponent shadow DOM.

This is primarily developed to support shared global CSS styles (for Bootstrap) applied automatically.

<br>
 
## Attributes
---
 
| Name               | Description                                                   |
|--------------------|---------------------------------------------------------------|
| disabled           | Disable shared styling (used only for theme switch)           |
| data-adoptable     | Mark "link" or "style"  element shared with shadow DOM        |
| data-theme         | Mark "link" or "style" as a shared theme                      |
 
<br>

## Usage 

```HTML
    <!-- Simple CSS sharing across WebComponent shadow DOM -->
    <link rel="stylesheet" href="/bootstrap-lit/assets/css/io.greenscreens.bootstrap.css" data-adoptable="true">

    <!-- Non blocking style preloading -->
    <link rel="preload" href="/bootstrap-lit/assets/css/io.greenscreens.bootstrap.css" as="style" data-adoptable="true">

    <!-- disable CSS -->
    <link rel="preload" href="/bootstrap-lit/assets/css/io.greenscreens.bootstrap.css" as="style" data-adoptable="true" disabled>

    <!-- style element examples -->
    <style data-adoptable="true"></style>
    <style data-adoptable="true" disabled></style>
    <style data-theme="theme1" disabled></style>
```


&copy; Green Screens Ltd. 2016 - 2025
