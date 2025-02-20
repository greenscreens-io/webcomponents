# GSEvents class
 
GSEvents static class is used as an internal event listener cache. The main purpose is to enable event listener cleanup and to prevent listener functions code memory leak.
 
When a GS webComponent listens to some event, events are registered in GSEvents static class cache.
 
When GS webComponent is removed from the document DOM tree, listeners are automatically cleared from the cache.
 
Instead of using this class directly, for all custom made WebComponents that extends **GSElement** use its inherited functions "listen", "unlisten", "attachEvent" etc.
 
For more info, please refer to **GSEvents** API doc.
 
NOTE: Please see [Install](../install.md) document for instructions on how to generate API manuals.
 
<br>

&copy; Green Screens Ltd. 2016 - 2025
