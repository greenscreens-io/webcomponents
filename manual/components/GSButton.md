# GSButton WebComponent
 
GSButton WebComponent is a Bootstrap Button renderer.
 
GSButton WebComponent extends [GSElement](../base/GSElement.md) and all its attributes and functions.
 
<br>
 
## Attributes
---
 
| Name               | Description                                                   |
|--------------------|---------------------------------------------------------------|
| type               | Button type (button,reset,submit)                             |
| size               | Button size (small,large,normal(default) )                    |
| color              | Button color - Bootstrap colors                               |
| disabled           | Render button disabled, ignore click events                   |
| outline            | Render button ouotlined                                       |
| active             | Render butto nselected                                        |
| icon               | Button icon, can be combined with title                       |
| title              | Button text                                                   |
| tooltip            | Info message on mouse hover                                   |
| text               | Button text color - Bootstrap colors                          |
| toggling           | Enable button active state changes                            |
| toggle-color       | Button Bootstrap color when in active state (toggled)         |
 
 

<br>
 
**NOTE:**

AttributeController is attached to the button. 
 
Please refer to the [AttributeController](../controllers/AttributeController.md) for attributes click handling options.
 
<br>
 
 
## Slots
| Name               | Description                                              |
|--------------------|----------------------------------------------------------|
| icon               | Place custom icon content                                |

<br>

## Example
---

**NOTE :** 
For more details, check [button.html](../../demos/button.html)
 
```html
<!-- Example with icon -->
<gs-button color="primary" title="Icon" icon="alarm me-1" tooltip="Test"></gs-button>
 
<!-- Test disabled button -->
<gs-button color="primary" title="Disabled" disabled tooltip="Test"></gs-button>
 
<!-- Toggle (show/hide) single target -->
<gs-button color="primary" title="Toggle" gs-toggle="d-none" gs-target="#b1" tooltip="test"></gs-button>
 
<!-- Toggle (show/hide) multiple targets -->
<gs-button color="primary" title="Toggle" gs-toggle="d-none" gs-target="#b1,#b2" tooltip="Test"></gs-button>
 
<!-- Example to dismiss target -->
<gs-button color="primary" title="Close and toggle"  gs-call="close" gs-target="#b1,#b2" tooltip="Test"></gs-button>
 
<!-- Toggle self state with 'active' class -->
<gs-button color="primary" title="Toggler" tooltip="Test"></gs-button>
 
 <!-- Send a nevent to parent component -->
 <gs-button color="primary" title="Confirm" data-gs-event="confirm" data-gs-bubbles="true" data-gs-composed="true"></gs-button>
```

<br>

&copy; Green Screens Ltd. 2016 - 2025
