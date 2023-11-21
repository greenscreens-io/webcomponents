# GSOffcanvas WebComponent
 
GSOffcanvas WebComponent is a renderer for Bootstrap Offcanvas with additional functionalities.
 
<br>
 
## Attributes
 
| Name               | Description                                              |
|--------------------|----------------------------------------------------------|
| css                | CSS classes for offcanvas content                        |
| css-head           | CSS classes for offcanvas header                         |
| css-body           | CSS classes for offcanvas body                           |
| css-title          | CSS classes for offcanvas title                          |
| autoclose          | Should autoclose on mouse of from offcanvas              |
| closable           | Should show close button (bool)                          |
| duration           | Time in sec. for how long to show when autoclosable is on|
| expanded           | Open / close offcanvas panel                             |
| fingers            | Number of fingers to swipe open                          |
| min                | Minimum width or height of offcanvas                     |
| max                | Maximum width or height of offcanvas                     |
| placement          | Where to place it (top,bottom,start,end)                 |
| scroll             | N/A                                                      |
| title              | Offcanvas header title                                   |
| transition         | Animation CSS action for slide in/out                    |
 
<br>
 
## Example
---
 
**NOTE :**
For more details, check [offcanvas.html](../../demos/offcanvas.html)
 
```html
<gs-offcanvas title="Offfcanvas panel" expanded="true" closable="false" placement="end"  backdrop="true"></gs-offcanvas>
```

<br>

&copy; Green Screens Ltd. 2016 - 2023
