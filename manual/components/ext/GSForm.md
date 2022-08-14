# GSForm WebComponent

GSForm WebComponent is an extended HTMLFormElement which adds following functionalities:

* Integration with ```<gs-modal>```
* Automatic ```<button>``` processing for Submit / Cancel
* Event triggering with field data exported as JSON

## Supported actions
---

When HTML buttons added to the component with **data-action** attributes, component itself will process such buttons automatically.

* **submit** - Will convert all input fields located under the **form** tag and trigger event **action**. 
* **cancel** - If form is under the ```<gs-modal>``` panel, panel will be closed.
* **reset**  - Will clear all input fields located under the **form** tag.

## Example
---

Define HTML form block with input fields and/or buttons as childs.

```html
<form is="gs-form">
    ... other input fields ...
    <button type="submit" data-action="submit">Submit</button>        
    <button data-action="cancel">Cancel</button>
    <button data-action="reset">Reset</button>
</form>
```
Sample code how to catch form **action** event triggered by buttons.

```JavaScript
cosnt frm = document.querySelector('.myform');
frm.addEventListener('action', e => console.log(e));
```