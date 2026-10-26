# GSSplitPanel WebComponent

GSSplitPanel WebComponent is a custom element helper for building SPA UI.
Component contains two side-by-side panels with resizer.

<br>

## Attributes
---

| Name               | Description                                                   |
|--------------------|---------------------------------------------------------------|
| resize             | Element selection for resizing (start,end,top,bottom)         |
| color              | Standard Bootstrap color names (primary, secondaray ...)      |
| horizontal         | If set, horizontal splitting is used.                         | 
| fixed              | If set, splitter is not available.                            | 
| width              | Optional component width in pixels.                           |
| height             | Optional component height in pixels.                          |
| min                | Minimum width/height for the panel controlled by the splitter. |
| max                | Maximum width/height for the panel controlled by the splitter. |

<br>


## Slots
---

| Name               | Description                                                   |
|--------------------|---------------------------------------------------------------|
| before             | Panel at the start/left or top position                       |
| after              | Panel at the end/right or bottom position                     |
        
<br>

## Example
---

**NOTE :** 
For more details, check [splitpanel.html](../../demos/splitpanel.html)


```html
<gs-split-panel width="600" height="400" color="light" margin="4" shadow border >
    <div slot="before">Left panel</div>
    <div slot="after">Right panel</div>
</gs-split-panel>   
```

<br>

&copy; Green Screens Ltd. 2016 - 2025
