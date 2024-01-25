# GSProgress WebComponent
 
GSProgress WebComponent is a renderer for Bootstrap Progress.
 
<br>
 
## Attributes
 
| Name               | Description                                              |
|--------------------|----------------------------------------------------------|
| label              | Progrs label expression                                  | 
| value              | Current progress value                                   | 
| step               | Increment by                                             | 
| min                | Minimum value allowed                                    | 
| max                | Maximum value allowd                                     | 

<br>

## Example
---
 
**NOTE :**
For more details, check [progress.html](../../demos/progress.html)
 
```html
<gs-progress label="${now} out of ${max} (${percentage}%)"></gs-progress>
```
 
Example from JavaScript.
 
```JavaScript
GSDOM.query('gs-progress').increase();
GSDOM.query('gs-progress').decrease();
```

<br>

&copy; Green Screens Ltd. 2016 - 2024
