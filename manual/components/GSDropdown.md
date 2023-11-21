# GSDropdown WebComponent
 
GSDropdown WebComponent renders Bootstrap Button with Dropdown menu.
 
Menu items can be loaded from an external **template** or can be added as component child elements, as shown in the example below.
 
<br>
 
## Attributes
---
 
| Name               | Description                                              |
|--------------------|----------------------------------------------------------|
| css                | CSS classes for button containing dropdown menu          |
| dark               | Is menu light or dark mode                               |
| template           | For loading menu item from remote html template          |
| title              | Button title                                             |
 
<br>
 
## Example
---

**NOTE :** 
For more details, check [dropdown.html](../../demos/dropdown.html)
 
```html
<gs-dropdown title="Dropdown 1" css="btn-primary me-1" dark="false" template="">
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
</gs-dropdown>
```
 
## Example
---
 
This example shows how to catch menu click events.
 
```JavaScript
const menu = GSComponents.find('gs-dropdown');
menu.listen('action', (e) => console.log(e.detail));
```

<br>

&copy; Green Screens Ltd. 2016 - 2023
