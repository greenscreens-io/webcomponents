# GSNav WebComponent
 
GSNav WebComponent renders Bootstrap Nav which can be used to toggle or dismiss target element/s, or to trigger a click action.
 
<br>
 
## Attributes ```<ga-nav>```
---
 
| Name               | Description                                                  |
|--------------------|--------------------------------------------------------------|
| css-nav            | CSS classes for nav bar                                      |
| bar                | Show as horizontal (true) or vertical (false)                |
 
<br>
 
## Attributes ```<gs-item>```
---
 
| Name               | Description                                                  |
|--------------------|--------------------------------------------------------------|
| css-nav            | CSS classes for nav item                                     |
| css-nav-wrap       | CSS classes for item wrapper                                 |
| active             | Render item as selected / active                             |
| icon               | CSS classes for item                                         |
| title              | Item text                                                    |
| action             | Event action to trigger on item click                        |
| href               | URL location to open on click                                |
| target             | CSS selector to element wich will be affected by click event |
| toggle             | *Type of target, defines different behavior                  |
| dismiss            | *Type of target, defines different behavior                  |
 
<br>
 
## Example
---
 
```html
<gs-nav css-nav="nav-pills" bar="true">
    <gs-item title="Home" css-nav-wrap="" css-nav=""></gs-item>
    <gs-item title="Test1"></gs-item>
    <gs-item title="Test2" icon="bi-alarm ms-1"></gs-item>
    <gs-item title="Test1" toggle="modal" target="#register"></gs-item>
</gs-nav>
```
 
## Example
 
This example shows how to catch list item click events.
 
```JavaScript
const menu = GSComponents.find('gs-nav');
menu.listen('action', (e) => console.log(e.detail));
```
