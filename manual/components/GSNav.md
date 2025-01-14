# GSNav WebComponent
 
GSNav WebComponent renders Bootstrap Nav which can be used to toggle or dismiss target element/s, or to trigger a click action.
 
<br>
 
## Attributes ```<ga-nav>```
---
 
| Name               | Description                                                  |
|--------------------|--------------------------------------------------------------|
| type               | Nav type (pills, tabs, underline)                            |
| bar                | Show as horizontal (true) or vertical (false)                |
 
<br>
 
## Attributes ```<gs-item>```
---

All attributes from [GSSelectableItem](./GSSelectableItem.md).

NOTE: GS-LIST-ITEM supports [GSAttributeHandler](../base/GSAttributeHandler.md) options.

<br>
 
## Example
---
 
**NOTE :**
For more details, check [nav.html](../../demos/nav.html)
 
```html
<gs-nav type="pills" bar>
    <gs-nav-item title="Home"></gs-nav-item>
    <gs-nav-item title="Test1"></gs-nav-item>
    <gs-nav-item title="Test2" icon="alarm ms-1"></gs-nav-item>
    <gs-nav-item title="Test1" gs-toggle="modal" gs-target="#register"></gs-nav-item>
</gs-nav>
```
 
## Example
 
This example shows how to catch list item click events.
 
```JavaScript
const menu = GSDOM.query('gs-nav');
menu.listen('action', (e) => console.log(e.detail));
```

<br>

&copy; Green Screens Ltd. 2016 - 2025
