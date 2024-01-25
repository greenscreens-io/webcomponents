# GSDrawer WebComponent
 
GSDrawer WebComponent is a renderer for Bootstrap Offcanvas with additional functionalities.
 
 GSDrawer is automatically contained.
 To render gs-drawer for the whole page (for SPA for example), place gs-drawer directly inside HTML body.
 When gs-drawer is placed within the HTML DIV elments, it will be rendererd within parent element.
 
<br>
 
## Attributes
 
| Name               | Description                                              |
|--------------------|----------------------------------------------------------|
| css-head           | CSS classes for drawer header                            |
| css-body           | CSS classes for drawer body                              |
| css-title          | CSS classes for drawer title                             |

| autoclose          | Should autoclose on mouse of from drawer                 |
| closable           | Should show close button (bool)                          |
| backdrop           | Should use backdrop layer to mmask background            |
| expanded           | Open / close drawer panel                                |
| scroll             | N/A                                                      |

| min                | Minimum width or height of drawer                        |
| max                | Maximum width or height of drawer                        |

| duration           | Time in sec. for how long to show when autoclosable is on|
| transition         | Animation CSS action for slide in/out                    |
| fingers            | Number of fingers to swipe open                          |
| placement          | Where to place it (top,bottom,start,end)                 |
| title              | Drawer header title                                      |
 
<br>
 
## Slots
| Name               | Description                                              |
|--------------------|----------------------------------------------------------|
| head               | Place HTML content into drawer header position           |
| body               | Place HTML content into drawer body position             |

<br>
 
## Example
---
 
**NOTE :**
For more details, check [drawer.html](../../demos/drawer.html)
 
```html
<gs-drawer title="Offfcanvas panel" placement="end" expanded closable backdrop>
    <div slot="header"></div>
    <div slot="body"></div>
</gs-drawer>
```

<br>

&copy; Green Screens Ltd. 2016 - 2024
