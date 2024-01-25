# GSToast WebComponent
 
GSToast WebComponent is a component that renders a single message in notification element.

Component creates a Bootstrap toast box..
 
 **NOTE:** Toast elements to work must be enclosed inside ```<ga-notification>``` element.
 
<br>

## Attributes

| Name         | Description                                |
|--------------|--------------------------------------------|
| closable     | Can user close a toast message (boolean)   |
| message      | Text to display when toast shows           |
| delay        | Autoclose dely in seconds. (0 never close) |
| opened       | Initial toast state.                       |

<br>

## Slots
---

| Name               | Description                                              |
|--------------------|----------------------------------------------------------|
| body               | Place HTML content into body position                    |
| header             | Place HTML content into header position                  |

<br>

## Example
---
 
**NOTE :** 
For more details, check [toast.html](../../../demos/toast.html)

```html
<gs-toast css="text-bg-dark" message="Welcome" delay="0" closable opened></gs-toast>
```

To programmatically popup a new toast message see [GSNotification](./GSNotification.md) component.
 
<br>

&copy; Green Screens Ltd. 2016 - 2024
