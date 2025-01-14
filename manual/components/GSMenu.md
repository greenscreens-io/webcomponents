# GSMenu WebComponent
 
GSMenu WebComponent renders Bootstrap menu.
 
<br>
 
## Attributes ```<ga-menu>```
---
 
| Name               | Description                                                  |
|--------------------|--------------------------------------------------------------|
| auto               | If set, menu to close automatically on mouse out             |
| opened             | If set, will render menu as opened                           |
| dark               | If set, menu dark theme will be used                         |
| reverse            | Used to position submenu opennig icon                        |

<br>
 
## Attributes ```<gs-item>```
---

All attributes from [GSSelectableItem](./GSSelectableItem.md). Use without "gs-" prefix for gs-item.

NOTE: GS-LIST-ITEM supports [GSAttributeHandler](../base/GSAttributeHandler.md) options.

<br>
 
 
## Example
---
 
**NOTE :**
For more details, check [menu.html](../../demos/menu.html)
 
```html
<gs-menu opened auto>
    <gs-item header="Menu group"></gs-item>
    <gs-item name="Open" action="open"></gs-item>
    <gs-item></gs-item>
    <gs-item name="Submenu 1">
        <gs-item name="Submenu 1" action="sub_1_1"></gs-item>
        <gs-item name="Submenu 2" action="sub_1_2"></gs-item>
    </gs-item>
    <gs-item name="Submenu 2">
        <gs-item name="Submenu 2.1" action="sub_2_1"></gs-item>
        <gs-item name="Submenu 2.2" action="sub_2_2"></gs-item>
        <gs-item name="Submenu 2.3">
            <gs-item name="Submenu 2.3.1" action="sub_2_3_1"></gs-item>
            <gs-item name="Submenu 2.3.2" action="sub_2_3_2"></gs-item>
        </gs-item>
    </gs-item>
</gs-menu>
```
 
## Example
 
This example shows how to catch list item click events.
 
```JavaScript
const menu = GSDOM.query('gs-list');
menu.listen('action', (e) => console.log(e.detail));
```

<br>

&copy; Green Screens Ltd. 2016 - 2025
