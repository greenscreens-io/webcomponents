# Green Screens WebComponents                                          
 
## Quick introduction
 
**WebComponent** - a W3C standard web technology where a custom HTML tag is registered to a JavaScript code which does the magic for that specific tag.
 
**GS WebComponent** - a Green Screens Ltd. implementation of custom WebComponents based on Bootstrap CSS 5.2.0+ used to build interactive UI interfaces for web applications and dashboards.
 
**GS WebComponents** use Bootstrap CSS only as Bootstrap Javascript is not shared across Shadow DOM. Instead, we developed our own module to handle special Bootstrap data-bs-* attributes.
 
**GS WebComponents** use flexible open Shadow DOM.
 
**GS WebComponents** can be root or nested component:
 
 - **Root elements** does not contain any other **gs-*** elements as their parent node
along the node tree chain. Difference between root and nested elements are event
handling mechanism.
 
 - **Nested elements** does not register to listen for some events. Root nodes, is
responsible for such events, their handling and optionally passing the signal
down the node tree chain to the nested 'gs-*' elements.
 
There are 3 types of WebComponents in use
 
    a. utility - for special purpose, not UI related (gs-template, gs-script, gs-style, etc.)
 
    b. templating based - most of UI components
 
    c. meta-rendering based - html generators components that generates Bootstrap HTML and other GS components for UI representation.
       
 
**GS WebComponents** are ES2022 JavaScript Classes written as JavaScript Modules in plain vanilla JavaScript without need for any external tools or other framework dependencies to be used in web browsers.
 