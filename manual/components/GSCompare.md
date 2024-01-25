# GSCompare WebComponent
 
GSCompare WebComponent is image comparator alllowing to show ovelaping "before" and "after" iamges with interactive slider.
  
<br>
 
## Attributes
---
 
| Name               | Description                                              |
|--------------------|----------------------------------------------------------|
| before             | First image                                              |
| after              | Second image                                             |
| background         | Bootstrap color for background                           |
| border             | Render border around                                     |
| shadow             | Render shadow around the frame                           |
| width              | Image width in pixels                                    |
| height             | Image height in pixels                                   |

***NOTE:*** It is recommendd that both images are of the same size and component width/height are preset to the same size.
Component will update width/height automatically when image is loaded if any of those values are not set.

<br>
 
## Example
---

**NOTE :**
For more details, check [Compare Demo](../../demos/compare.html)

```HTML
<gs-compare before="image-1 url" after="iamge-2 url"></gs-compare>
```
 
<br>

&copy; Green Screens Ltd. 2016 - 2024
