# GSContext WebComponent
 
GSContext WebComponent is an element context menu. Internally, it generates a Bootstrap Dropdown with positioning to a current cursor coordinates.
 
The component supports menu with submenus as shown in the example below. Use generic ```<gs-item>``` tag to define menu structure.
 
Menu items can be loaded from an external **template** or can be added as component child elements, as shown in the example below.
 
 <br>
 
## Attributes
---
 
| Name               | Description                                              |
|--------------------|----------------------------------------------------------|
| css                | CSS classes for button containing dropdown menu          |
| dark               | Is menu light or dark mode                               |
| disabled           | If exists, disable context menu click activation         |
| title              | Button title                                             |
 
<br>

## Example
---
 
**NOTE :** 
For more details, check [contextmenu.html](../../demos/contextmenu.html)

```html
    <gs-context target="body" css="" template="">
        <gs-item name="Open" action="open"></gs-item>
        <gs-item></gs-item>
        <gs-item name="Submenu 1">
            <gs-item name="Submenu 1.1" action="sub_1_1"></gs-item>
            <gs-item name="Submenu 1.2" action="sub_1_2"></gs-item>
        </gs-item>
        <gs-item name="Submenu 2">
            <gs-item name="Submenu 2.1" action="sub_2_1"></gs-item>
            <gs-item name="Submenu 2.2" action="sub_2_2"></gs-item>
            <gs-item name="Submenu 2.3">
                <gs-item name="Submenu 2.3.1" action="sub_2_3_1"></gs-item>
                <gs-item name="Submenu 2.3.2" action="sub_2_3_2"></gs-item>
            </gs-item>              
        </gs-item>        
    </gs-context>
```
 
## Example
---
 
This example shows how to catch menu click events.
 
```JavaScript
const ctx = GSComponents.find('gs-context');
ctx.listen('action', (e) => console.log(e.detail));
```

