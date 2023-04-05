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

<br>

## Development Basics

Many developers get used to programming models such as MVC, MMVC, MMVM etc... and also to server side compiling  / transpilig tools. Here, those tools are not required.

With Green Screens WebComponents, **everything is a WebComponent**.

It is different approach, relying soley on browser engine and tag activation. There is no need for custom **controller** classes etc. Every component is a handler for child element (html tags) and forwards native browser events across components.

To learn more how to develop SPA applications with WebComponents, check out our showcase apps such as [Extension App](../demos/extension/index.html).

[Extension App](../demos/extension/index.html) is a showcase UI for our browser extension for Green Screens Web Terminal for IBM i developed with WebComponents. Here, the basic development concepts are presented showing interaction between various componentes and dynamic templates.

<br>

## Global variables

Global variables are framework flags that needs to be set in head of a documnet, before loading framework.

| Variable              | Type      | Description                                       |
|-----------------------|-----------|---------------------------------------------------|
| self.GS_DEV_MODE      | Boolean   | Set to true to expose Classes to the global scope | 
| self.GS_NO_CACHE      | Boolean   | Set to true to prevent browser caching            | 
| self.GS_FLAT          | Boolean   | Set to true to prevent Shadow DOM                 | 
| self.GS_FORMAT_DATE   | String    | Default date format                               | 
| self.GS_TEMPLATE_URL  | String    | Set path to templates                             |

<br>

## Source Code Organization

There are 3 main parts:

* Core - [Head](../modules/head/), [Templating](../modules/templating/), [Base](../modules/base/) libraries are core engine to build GS WebComponents and handle various browser "things"
* UI - [Components](../modules/components/) library is a set of UI WebComponents based on Bootstrap 5.2.0+ CSS
* Extra - [Extra](../modules/extra/) is set of UI elements which wraps around 2rd party libs to meke their usage easier. Ligs such as [ChratJS](https://www.chartjs.org/), [MS Monacco](https://microsoft.github.io/monaco-editor/) and [HLJS](https://highlightjs.org/). 

### UI Library

UI Library contains 2 type of WebComponents, those which extends [GSElement](../modules/base/GSElement.mjs), and those which extends standard browser HTML* classes.

UI WebComponents are divided into following groups

* Template based - contains predefined Bootstrap template for specific Bootstrap UI such as [GSModal](../modules/components/GSModal.mjs)
* Generator based - dynamically renders HTML, mostly Bootstrap based such as [GSDropdown](../modules/components/GSDropdown.mjs) 
* Composites based - similar to generators, but reders a template based on multiple GS Components such as [GSTable](../modules/components/table/GSTable.mjs)
* Extension based - extends browser native HTMLElement descendats, such as [GSTable](../modules/components/ext/GSFormExt.mjs). Requires extending native tag with "is" attribute... ```<form is="gs-ext-form"></gsform>```

### CSP - Content Securit Policy

In some cases, CSP errors might show up in the browser console. All components uses CSS API which should be compatible with CSP to allow dynamic CSS styles change, however, for static resources such as Base64 inline encoded images or SVG, use CSP policy __img-src 'self' data:__

