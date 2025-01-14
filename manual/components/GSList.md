# GSList WebComponent
 
GSList WebComponent renders a Bootstrap List which can be used to toggle or dismiss target element/s, or to trigger a click action.
 
<br>
 
## Attributes ```<ga-list>```
---
 
| Name               | Description                                                  |
|--------------------|--------------------------------------------------------------|
| multi              | If set, allow multiple items selected                        |
| selectable         | Show clicked / selected item                                 |
 
<br>
 
## Attributes ```<gs-list-item>```
---

All attributes from [GSSelectableItem](./GSSelectableItem.md).

NOTE: GS-LIST-ITEM supports [GSAttributeHandler](../base/GSAttributeHandler.md) options.

<br>
 
 
## Example
---
 
**NOTE :**
For more details, check [list.html](../../demos/list.html)
 
```html
<gs-list css="">
    <gs-list-item title="Home" gs-target="#content" gs-toggle="collapse"></gs-list-item>
    <gs-list-item title="About" href="./mypage.html"></gs-list-item>
    <gs-list-item title="Test1" gs-action="test1">
        <gs-template href="//content.html"></gs-template>
    </gs-list-item>
    <gs-list-item title="Test2" gs-action="test2">
        <div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1">List group item heading</h5>
            <small class="text-muted">3 days ago</small>
        </div>
        <p class="mb-1">Some placeholder content in a paragraph.</p>
        <small class="text-muted">And some muted small print.</small>              
    </gs-list-item>
</gs-list>
```
 
## Example
 
This example shows how to catch list item click events.
 
```JavaScript
const menu = GSDOM.query('gs-list');
menu.listen('action', (e) => console.log(e.detail));
```

<br>

&copy; Green Screens Ltd. 2016 - 2025
