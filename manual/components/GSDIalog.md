# GSDIalog WebComponent
 
GSDIalog WebComponent is a renderer for native ```<dialog>``` with Bootstrap support for external resource templates as modal content.
 
This is browser native version t oBootstrap Modal. If ```<dialog>``` si not supported by the browser us GSModal instead.
 
<br>
 
## Attributes
---
 
| Name               | Description                                                  |
|--------------------|--------------------------------------------------------------|
| cancelable         | Is cancel button available (bool)                            |
| closable           | Can user close dialog                                        |
| escapable          | use Esc to close dialog                                      |
| opened             | Is dialog visible                                            |
| rounded            | Render roudned corners                                       |
| shadow             | Render dialog shadow                                         |
| title              | Modal title message                                          |
| message            | Modal message                                                |
| cancelText         | Cancel button text                                           |
| confirmText        | Confirm button text                                          |
| button-align       | Align modal buttons (start, end, center)                     |
| color-cancel       | Bootstrap color for cacnel button                            |
| color-confirm      | Bootstrap color for confirm button                           |
| icon-cancel        | Bootstrap icon for cacnel button                             |
| icon-confirm       | Bootstrap icon for confirm button                            |
| css-content        | CSS classes for modal frame                                  |
| css-header         | CSS classes for modal header block                           |
| css-title          | CSS classes for modal title block                            |
| css-body           | CSS classes for modal body block                             |
| css-footer         | CSS classes for modal footer block                           |
 
 <br>
 
## Slots
---

| Name               | Description                                              |
|--------------------|----------------------------------------------------------|
| title              | Place HTML content into title position                   |
| body               | Place HTML content into body position                    |
| extra              | Place extra HTML content for out of UI elements          |

<br>

## Example
---
 
**NOTE :**
For more details, check [Dialog Demo](../../demos/dialog/)
 
```html
<!-- open modal with a button -->
<gs-button css="btn-primary" title="Toggle" gs-call="open" gs-target="#dialog1"></gs-button>
 
<!-- modal panel -->
<gs-dialog template="#modal" id="dialog1" opened>
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
const modal = GSDOM.query('#dialog1');
modal.listen('action', e => console.log(e));
modal.open();
```
 
Wait for click event

```JavaScript
const modal = GSDOM.query('#dialog1');
modal.open();
await modal.waitEvent('action');
// or use form when modal contains form
await modal.waitEvent('form');
```

Wait for modal to be closed 

```JavaScript
const modal = GSDOM.query('#dialog1');
await modal.prompt('My Title', 'My content');
```

To send modal close from injected child (template inside body)

```JavaScript
const child = ... some element inside injected template ....
GSUtil.sendEvent(child, 'dialog', {type : 'close'}, true, true);
```

<br>

&copy; Green Screens Ltd. 2016 - 2024
