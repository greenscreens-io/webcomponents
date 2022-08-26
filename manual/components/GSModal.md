# GSModal WebComponent
 
GSModal WebComponent is a renderer for Bootstrap Modal with support for external resource templates as modal content.
 
<br>
 
## Attributes
---
 
| Name               | Description                                                  |
|--------------------|--------------------------------------------------------------|
| align              | Align modal buttons (start, end, center)                     |
| body               | Modal body text or html                                      |
| button-ok          | Title for OK button                                          |
| button-cancel      | Title for CANCEL button                                      |
| css-button-ok      | CSS classes for OK button                                    |
| css-button-cancel  | CSS classes for CANCEL button                                |
| cancelable         | Is cancel button available (bool)                            |
| closable           | Can user close modal                                         |
| title              | Modal title message                                          |
| visible            | Is modal initially visible                                   |
 
 <br>
 
## Events

For cancelable events, call e.preventDefault() to cancel operations (closing a modal for example).

---
| Name               | Description                                                  |
|--------------------|--------------------------------------------------------------|
| action             | Cancelable button action (e.data.ok = true | false )         |
| close              | Cancelable event before modal is closed                      |
| data               | Data event when modal contains gs-ext-form element (form submit) |
| open               | Cancelable event before modal is opened                      |
| visible            | Event triggered when modal visibility status changed         |

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
 
Listen for button **ok** or **cancel** click. 
 
```JavaScript
const modal = GSComponent.get('#dialog1');
modal.listen('action', e => console.log(e));
modal.open();
```
 
Wait for click event

```JavaScript
const modal = GSComponent.get('#dialog1');
modal.open();
await modal.waitEvent('action');
// or use form when modal contains form
await modal.waitEvent('form');
```

Wait for modal to be closed 

```JavaScript
const modal = GSComponent.get('#dialog1');
await modal.prompt('My Title', 'My content');
```

To send modal close from injected child (template inside body)

```JavaScript
const child = ... some element inside injected template ....
GSUtil.sendEvent(child, 'modal', {type : 'close'}, true, true);
```
