# GSAttributeHandler Class
 
 GSAttributeHandler process gs-* attributes. It is used to control click actions for buttons and links and for meta linking between UI elements.

<br>

## Attributes - generic attributes across all inherited components
---

| Name                    | Description                                                         |
|-------------------------|---------------------------------------------------------------------|
| data-gs-action          | Send 'action' event to teh target                                   |
| data-gs-anchor          | Where to anchor injected html (self, beforebegin, afterbegin, etc.) | 
| data-gs-attribute       | Togle element attribute (k=v;k1=v1 or JSON format)                  |
| data-gs-call            | Calls a function on a given target (multiple functions supported)   |
| data-gs-exec            | Execute a function (alternative to the call)                        | 
| data-gs-inject          | Inject HTML content; used for WebComponent append                   | 
| data-gs-property        | Togle element property (k=v;k1=v1 or JSON format)                   |
| data-gs-swap            | Swap HTML content; used for WebComponent replacement                |
| data-gs-target          | CSS query for a target or targets                                   |
| data-gs-timeout         | A timeout between class toggle                                      |
| data-gs-template        | Template to load and inject template                                |
| data-gs-toggle          | Toggle CSS classes on a given target                                |
| data-gs-trigger         | Triggers an event on a given target                                 | 
| data-gs-value           | Value to pass to a data-gs-call or data-gs-trigger,  or use as URL  |

TODO to implement
| data-gs-refresh         | Number of times to execute (-1 unlimited; n - number of iterations) | 
    
 **NOTE:** gs-swap and gs-inject uses gs-anchor to determine where to inject html. If not, set, innerHTML is used.

<br>

## Usage 

```HTML
   <!-- Simple element toggle (menus, drawers etc) -->
   <gs-button data-gs-target="gs-menu" data-gs-call="toggle"></gs-button>

   <!-- Simple web component switch inside target element -->
   <gs-button data-gs-target="#content" data-gs-swap="users-view"></gs-button>

    <!-- Toggle element CSS classes -->
   <gs-button data-gs-target="gs-accordion:nth-child(1)" data-gs-toggle="collapse show" data-gs-timeout="0.2"></gs-button>

    <!-- Toggle input element attributes -->
   <gs-button data-gs-target="input,select,textarea" data-gs-attribute="disabled"></gs-button>   

    <!-- Set element property -->
   <gs-button data-gs-target="gs-offscreen" data-gs-property="{opened:true}" title="Open"></gs-button>   

    <!-- Toggle input element attributes -->
   <gs-button data-gs-template="//demo.html" data-gs-anchor="afterend" target="#header"></gs-button>   

    <!-- Trigger event on element -->
   <gs-button data-gs-trigger="reload" target="#gs-data-handler"></gs-button>   
```

<br>

&copy; Green Screens Ltd. 2016 - 2025
