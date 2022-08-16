# GSDataAttr Class
 
GSDataAttr class is a static internal class that replace Bootstrap JavaScript library for **toggles**, **modals** and **dismiss** handlers.
 
The reason why Bootstrap JavaScript is not used is lack of support for Shadow DOM used by many of WebComponents.
 
Every Shadow DOM would need its own instance of Bootstrap JavaScript library, which would create a memory / performance issues. Instead, we developed this module as a replacement.
 
As DOM Observer is used to monitor element add / remove events to a page, this class will detect standard Bootstrap **data-bs-*** attributes and attach proper click listeners to automatically handle mouse click events such as modal popup, collapse, offcanvas open and many more.

 * Process Bootstrap data-bs-* attributes
 * toggle="offcanvas|collapse|dropdown|button|tab|pill|popover|tooltip|modal|popup"
 * dismiss="offcanvas|modal|alert|popup"
 
 Additional attributes used for automatic handling

 * ***data-css*** - CSS class for injected template
 * ***data-inject*** - Target where to inject template
 