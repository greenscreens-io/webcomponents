# GSPopup WebComponent

GSPopup WebComponent is a component similar to GSContext except it is generic popup element that will open a custom popup box.

<br>

## Attributes
---

| Name               | Description                                              |
|--------------------|----------------------------------------------------------|
| autoclose          | Close popup on mouseleave                                |
| css                | CSS classes for popup content                            |
| placement          | Where to popup element (start,end,top,bottom)            |
| target             | Element on which to popup                                | 
| template           | Popup content template                                   | 
| trigger            | Terget element event to trigger popup (click)            |
| visible            | Show or hide popup (bool)                                | 
| hPos               | Postion popup on X-Axis                                  | 
| vPos               | Postion popup on Y-Axis                                  | 
| hMax               | Popup height max in pixels                               | 
| vMin               | Popup height min in pixels                               | 
| wMax               | Popup width  max in pixels                               | 
| wMin               | Popup width  min in pixels                               | 

<br>

## Example
---
 
**NOTE :** 
For more details, check [Popup demo](../../demos/popup/)

With injected template 

```html
<gs-popup target="#" placement="bottom" css="" template="//content.html"></gs-popup>
```

With internal HTML

```html
<gs-popup target="#" placement="bottom" css="">
    <slot>
        ... some html code ...
    </slot>
</gs-popup>
```
Visible on load at specified location

```html
<gs-popup target="#" v-pos="0" h-pos="300" css="" template="//content.html"></gs-popup>
```

