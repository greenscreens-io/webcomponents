# GSNav WebComponent
 
GSNav WebComponent renders Bootstrap Nav which can be used to toggle or dismiss target element/s, or to trigger a click action.
 
<br>
 
## Attributes ```<ga-nav>```
---
 
| Name               | Description                                                  |
|--------------------|--------------------------------------------------------------|
| type               | Nav type (pills, tabs, underline)                            |
| vertical           | Render the nav vertically                                   |
| placement          | Vertical tab placement or horizontal item justification     |
 
<br>
 
## Attributes ```<gs-item>```
---

Nav item attributes include `title`, `icon`, `href`, `target`, `active`,
`disabled`, `autofocus`, and `tooltip`.

<br>
 
## Events 
---
All events from [GSGroup](./GSGroup.md).

<br>

## Custom controllers

Controller definition is the same as from [GSGroup](./GSGroup.md).

<br>
 
## Example
---
 
**NOTE :**
For more details, check [nav.html](../../demos/nav.html)
 
```html
<gs-nav type="pills" vertical>
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
