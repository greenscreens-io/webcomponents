# GSDIalog WebComponent
 
GSDIalog WebComponent is a renderer for native ```<dialog>``` with Bootstrap support for external resource templates as modal content.
 
This is browser native version t oBootstrap Modal. If ```<dialog>``` si not supported by the browser us GSModal instead.

<br>
 
## Attributes
---
 
| Name               | Description                                                  |
|--------------------|--------------------------------------------------------------|
| body               | Modal body text or html                                      |
| button-align       | Align modal buttons (start, end, center)                     |
| button-cancel      | Title for CANCEL button                                      |
| button-ok          | Title for OK button                                          |
| css-button-ok      | CSS classes for OK button                                    |
| css-button-cancel  | CSS classes for CANCEL button                                |
| css                | CSS classes for modal background (default: transparent)      |
| css-content        | CSS classes for modal frame                                  |
| css-header         | CSS classes for modal header block                           |
| css-title          | CSS classes for modal title block                            |
| css-body           | CSS classes for modal body block                             |
| css-footer         | CSS classes for modal footer block                           |
| cancelable         | Is cancel button available (bool)                            |
| closable           | Can user close modal                                         |
| title              | Modal title message                                          |
| visible            | Is modal initially visible                                   |
 
 <br>
 
## Events

For cancelable events, call e.preventDefault() to cancel operations (closing a modal for example).

---
| Name               | Description                                                      |
|--------------------|------------------------------------------------------------------|
| action             | Cancelable button action (e.data.ok = true | false )             |
| beforeclose        | Cancelable event before modal is closed                          |
| beforeopen         | Cancelable event before modal is opened                          |
| close              | Trigger event from underlying child to close dialog              |
| data               | Data event when modal contains gs-ext-form element (form submit) |
| visible            | Event triggered when modal visibility status changed             |

<br>
 
## Example
---
 
**NOTE :**
For more details, check [Dialog Demo](../../demos/dialog/)
 
```html
<!-- open modal with a button -->
<gs-button css="btn-primary" title="Toggle" toggle="modal" target="#dialog1"></gs-button>
 
<!-- modal panel -->
<gs-dialog template="#modal" id="dialog1" visible="true">
    <h4 slot="title">Login</h4>
    <!-- modal content laode dfrom external resource -->
    <gs-template slot="body" flat="true" href="//dialog.tpl"></gs-template>
</gs-dialog>
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
GSUtil.sendEvent(child, 'dialog', {type : 'close'}, true, true);
```

<br>

&copy; Green Screens Ltd. 2016 - 2023
