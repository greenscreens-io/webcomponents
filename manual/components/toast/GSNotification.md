# GSNotification WebComponent
 
GSNotification WebComponent is a component that renders Bootstrap Notification placeholder.
 
Component creates a simple Bootstrap **toast-container** panel when notification will be shown.
 
The real power of this component comes when used from JavaScript, allowing simplified toasts through a simple script.
 
<br>
 
## Attributes
---
 
| Name               | Description                                                    |
|--------------------|----------------------------------------------------------------|
| position           | Predefined CSS TOP_LEFT,TOP_CENTER,TOP_END ...(MIDDLE, BOTTOM) |
| native             | Use native browser notification (boolean)                      |
 
Position atribute values:
 - TOP_START
 - TOP_END
 - TOP_CENTER
 - MIDDLE_START
 - MIDDLE_END
 - MIDDLE_CENTER
 - BOTTOM_START
 - BOTTOM_END
 - BOTTOM_CENTER
<br>

## Example
---
 
To define **Notification** and default toast.
 
```html
<gs-notification css="" position="BOTTOM_END">
    <gs-toast slot="content" css="bg-dark text-bg-dark" message="Dynamic toast" timeout="0" visible id="toast"></gs-toast>
    <gs-toast slot="content" css="" message="Welcome to the portal" delay="2" visible="true"></gs-toast>
    <gs-toast slot="content" css="" message="Please login with email" closable delay="40" visible></gs-toast>
</gs-notification>
```
 
To programmatically popup a new notification message.
 
```JavaScript
const notifier = GSDOM.query('gs-notification');
notifier.native = false;
// Shows a toast for 5 sec. without close button.
notifier.info('My Title', 'My message', false, 5);
```

To programmatically popup a new browser native notification
 
```JavaScript
const notifier = GSDOM.query('gs-notification');
notifier.native = true;
// Shows a toast for 5 sec.
notifier.info('My Title', 'My message', false, 5);
```

<br>

&copy; Green Screens Ltd. 2016 - 2024
