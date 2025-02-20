# GSLink WebComponent
 
GSLink WebComponent is a Bootstrap A element renderer. 
 
<br>
 
## Attributes
---
 
| Name               | Description                                                   |
|--------------------|---------------------------------------------------------------|
| disabled           | Render button disabled, ignore click events                   |
| rounded            | Render button disabled, ignore click events                   |
| border             | Render button disabled, ignore click events                   |
| size               | Button size (small,large,normal(default) )                    |
| color              | Button color - Bootstrap colors                               |
| text               | Button text color - Bootstrap colors                          |
| icon               | Button icon, can be combined with title                       |
| title              | Button text                                                   |
| tooltip            | Info message on mouse hover                                   |
| target             | A element target                                              |
| url                | A element href                                                |
 
<br>
 
**NOTE:**

AttributeController is attached to the button. 
 
Please refer to the [AttributeController](../base/AttributeController.md) for attributes click handling options.
 
<br>
 
## Slots
---

| Name               | Description                                              |
|--------------------|----------------------------------------------------------|
| icon               | Place HTML content into icon position                    |

<br>

## Example
---

**NOTE :** 
For more details, check [link.html](../../demos/link.html)
 
```html
<!-- Example with icon -->
 <gs-link title="Click Me" url="#" text="primary" icon="bug"></gs-link>     
```

<br>

&copy; Green Screens Ltd. 2016 - 2025
