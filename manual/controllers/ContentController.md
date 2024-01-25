
# Green Screens ContentController

This is internal helper controller to clean up rendered HTML when the component is removed from the DOM.

Some component can be rendered out of shadow DOM and WebComponent tree. 
Without this controller, such components, when removed will left rendered HTML.

Cleanup is automatic, but in order to keep the HTML, set flag "keep" to ignore this controlelr activity.

<br>

&copy; Green Screens Ltd. 2016 - 2024
