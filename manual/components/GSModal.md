# GSModal WebComponent
 
GSModal WebComponent is a renderer for Bootstrap Modal with support for external resource templates as modal content.
 
<br>
 
## Attributes
---
 
| Name               | Description                                                  |
|--------------------|--------------------------------------------------------------|
| align              | Align modal buttons (start, end)                             |
| body               | Modal body text                                              |
| cancelable         | Is cancel button available (bool)                            |
| closable           | Can user close modal                                         |
| title              | Modal title message                                          |
| visible            | Is modal initially visible                                   |
 
<br>
 
## Example
---
 
**NOTE :**
For more details, check [Modal Demo](../../demos/modal/)
 
```html
<!-- open modal with a button -->
<gs-button css="btn-primary" title="Toggle" toggle="modal" target="#dialog1"></gs-button>
 
<!-- modal panel -->
<gs-modal template="#modal" id="dialog1" visible="true">
    <h4 slot="title">Login</h4>
    <!-- modal content laode dfrom external resource -->
    <gs-template slot="body" flat="true" href="//dialog.tpl"></gs-template>
</gs-modal>
```
 
<br>
 
## Example
---
 
Demos below shows how to work with Modal in programmatic way.
 
```JavaScript
const modal = GSComponent.get('#dialog1');
modal.listen('action', e => console.log(e));
modal.open();
```
 
```JavaScript
const modal = GSComponent.get('#dialog1');
modal.open();
await modal.waitEvent('action');
```
 
```JavaScript
const modal = GSComponent.get('#dialog1');
await modal.prompt('My Title', 'My content');
```
