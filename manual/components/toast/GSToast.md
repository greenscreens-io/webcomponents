# GSToast WebComponent
 
GSToast WebComponent is a component that renders a single message in notification element.

Component creates a Bootstrap toast box..
 
 **NOTE:** Toast elements to work must be enclosed inside ```<ga-notification>``` element.
 
<br>

## Attributes

| Name         | Description                              |
|--------------|------------------------------------------|
| css          | Custom CSS for a single toast            |
| closable     | Can user close a toast message (boolean) |
| message      | Text to display when toast shows         |
| slot         | Default injection target (content)       |
| timeout      | Seconds to take before toast autoclose. Set 0 to never close. |
| visible      | Initial toast state.                     |

<br>

## Example
---
 
**NOTE :** 
For more details, check [toast.html](../../../demos/toast.html)

```html
<gs-toast slot="content" css="text-bg-dark" message="Welcome" closable="false" timeout="0" visible="true"></gs-toast>
```

To programmatically popup a new toast message see [GSNotification](./GSNotification.md) component.
 
