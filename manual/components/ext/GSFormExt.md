# GSFormExt WebComponent

GSFormExt WebComponent is an extended HTMLFormElement which adds following functionalities:

* Integration with ```<gs-modal>```
* Automatic ```<button>``` processing for Submit / Cancel
* Event triggering with field data exported as JSON

## Supported actions
---

When HTML buttons added to the component with **data-action** attributes, component itself will process such buttons automatically.

* **submit** - Will convert all input fields located under the **form** tag and trigger event **action**. 
* **cancel** - If form is under the ```<gs-modal>``` panel, panel will be closed.
* **reset**  - Will clear all input fields located under the **form** tag.

<br>

## Example
---

Define HTML form block with input fields and/or buttons as childs.

```html
<form is="gs-ext-form">
    ... other input fields ...
    <button type="submit" data-action="submit">Submit</button>        
    <button data-action="cancel">Cancel</button>
    <button type="reset" data-action="reset">Reset</button>
</form>
```
 
## Events
---

Custom event **form** is triggered on form **submit**, **cancel** or **invalid** validation.

Check for **e.data.type** to determine type of form action.

```JavaScript
cosnt frm = document.querySelector('.myform');
frm.addEventListener('form', e => console.log(e.data.type));
```