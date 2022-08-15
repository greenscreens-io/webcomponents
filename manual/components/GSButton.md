# GSButton WebComponent
 
GSButton WebComponent is a Bootstrap Button renderer.
 
GSButton WebComponent extends [GSElement](../base/GSElement.md) and all its attributes and functions.
 
<br>
 
## Attributes
---
 
| Name               | Description                                                  |
|--------------------|--------------------------------------------------------------|
| css                | CSS classes for button                                       |
| comment            | Info message on mouse hover                                  |
| disable            | Render button disabled, ignore click events                  |
| icon               | Button icon, can be combined with title                       |
| title              | Button text                                                  |
| target             | CSS selector to element which will be affected by click event |
| toggle             | *Type of target, defines different behavior                  |
| dismiss            | *Type of target, defines different behavior                  |
 
<br>
 
**NOTE:**
 
Attributes **toggle** and **dismiss** are shorthand for Bootstrap **data-bs-toggle** and **data-bs-dismiss** attributes.
 
Please refer to the [GSDataAttr](./ext/GSDataAttr.md) for attributes values required to select target type.
 
<br>
 
## Example
---
 
```html
<!-- Example with icon -->
<gs-button css="btn-primary" title="Icon" icon="bi-alarm me-1" comment="Test"></gs-button>
 
<!-- Test disabled button -->
<gs-button css="btn-primary" title="Disabled" disable="true" comment="Test"></gs-button>
 
<!-- Toggle (show/hide) single target -->
<gs-button css="btn-primary" title="Toggle" toggle="button" target="#b1" comment="test"></gs-button>
 
<!-- Toggle (show/hide) multiple targets -->
<gs-button css="btn-primary" title="Toggle" toggle="button" target="#b1,#b2" comment="Test"></gs-button>
 
<!-- Example to dismiss target -->
<gs-button css="btn-primary" title="Close and toggle"  dismiss="alert" target="#b1,#b2" comment="Test"></gs-button>
 
<!-- Toggle self state with 'active' class -->
<gs-button css="btn-primary" title="Toggler" comment="Test"></gs-button>
 
```
