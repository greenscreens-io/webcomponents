# GSSplitter WebComponent

GSSplitter WebComponent is a custom element for resizing top|bottom or start|end sibling elements.

<br>

## Attributes
---

| Name               | Description                                                   |
|--------------------|---------------------------------------------------------------|
| css                | CSS classes for resizer                                       |
| resize             | Element selection for resizing (start,end,top,bottom)         |
| size               | Width or height of resizer                                    |
| split              | Orientation (vertical, horizontal)                            |

<br>

## Example
---

**NOTE :** 
For more details, check [splitter.html](../../demos/splitter.html)

```html
<div>test top</div>
<gs-splitter split="horizontal"></gs-splitter>
<div>test bottom</div>
```

```html
<div>test start / left</div>
<gs-splitter split="vertical"></gs-splitter>
<div>test end / right</div>
```
