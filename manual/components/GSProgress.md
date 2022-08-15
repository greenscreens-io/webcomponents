# GSProgress WebComponent
 
GSProgress WebComponent is a renderer for Bootstrap Progress.
 
## Example
---
 
**NOTE :**
For more details, check [progress.html](../../demos/progress.html)
 
```html
<gs-progress label="${now} out of ${max} (${percentage}%)"></gs-progress>
```
 
Example from JavaScript.
 
```JavaScript
GSComponents.find('gs-progress').increase();
GSComponents.find('gs-progress').decrease();
```
