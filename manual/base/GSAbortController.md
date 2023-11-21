# GSAbortController class
 
GSAbortController class is a generic implementaion extending browser native AbortController class adding timout support. 
 
For more info, please refer to **AbortController** API doc.
 
NOTE: Please see [Install](../install.md) document for instructions on how to generate API manuals.
 
## Usage 

```JavaScript
// standard Abortontroller does not support timeout
const controller = GSAbortController(1000);
// block until aborted
await controller.wait();
```
<br>

&copy; Green Screens Ltd. 2016 - 2023
