# GSNotification WebComponent
 
GSNotification WebComponent is a component that renders Bootstrap Notification placeholder.
 
Component creates a simple Bootstrap **toast-container** panel when notification will be shown.
 
The real power of this component comes when used from JavaScript, allowing simplified toasts through a simple script.
 
## Example
---
 
To define **Notification** and default toast.
 
```html
<gs-notification css="">
    <gs-toast slot="content" css="bg-dark text-bg-dark" message="Dynamic toast" closable="false" timeout="0" visible="true" id="toast"></gs-toast>
    <gs-toast slot="content" css="" message="Welcome to the portal" closable="false" timeout="2" visible="true"></gs-toast>
    <gs-toast slot="content" css="" message="Please login with email" closable="true" timeout="40" visible="true"></gs-toast>
    </gs-notification>
```
 
To programmatically popup a new toast message.
 
```JavaScript
const notifier = document.querySelector('gs-notification');
// Shows a toast for 5 sec. without close button.
notifier.info('My Title', 'My message', false, 5);
```
