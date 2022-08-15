# GSList WebComponent
 
GSList WebComponent renders a Bootstrap List which can be used to toggle or dismiss target element/s, or to trigger a click action.
 
<br>
 
## Attributes ```<ga-list>```
---
 
| Name               | Description                                                  |
|--------------------|--------------------------------------------------------------|
| css                | CSS classes for item wrapper                                 |
| selectable         | Show clicked / selected item                                 |
 
<br>
 
## Attributes ```<gs-item>```
---
 
| Name               | Description                                                  |
|--------------------|--------------------------------------------------------------|
| css                | CSS classes for item                                         |
| action             | Event action to trigger on item click                        |
| href               | URL location to open on click                                |
| target             | CSS selector to element which will be affected by click event |
| toggle             | *Type of target, defines different behavior                  |
| dismiss            | *Type of target, defines different behavior                  |
 
<br>
 
 
## Example
---
 
**NOTE :**
For more details, check [list.html](../../demos/list.html)
 
```html
<gs-list css="" selectable="false">
    <gs-item title="Home" target="#content" toggle="collapse"></gs-item>
    <gs-item title="About" href="./mypage.html"></gs-item>
    <gs-item title="Test1" action="test1">
        <gs-template href="//content.html"></gs-template>
    </gs-item>
    <gs-item title="Test2" action="test2">
        <div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1">List group item heading</h5>
            <small class="text-muted">3 days ago</small>
        </div>
        <p class="mb-1">Some placeholder content in a paragraph.</p>
        <small class="text-muted">And some muted small print.</small>              
    </gs-item>
</gs-list>
```
 
## Example
 
This example shows how to catch list item click events.
 
```JavaScript
const menu = GSComponents.find('gs-list');
menu.listen('action', (e) => console.log(e.detail));
```
