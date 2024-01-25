# GSImage WebComponent
 
GSImage WebComponent is a wrapper around standard HTMLImage element aiz hadditional properties to modify image filters.
  
<br>
 
## Attributes
---
 
| Name               | Description                                              |
|--------------------|----------------------------------------------------------|
| width              | Image width in pixels                                    |
| height             | Image height in pixels                                   |
| opacity            | Transparency 0..1 in steps of 0.1                        |
| invert             | Color invert  0..1 in steps of 0.1                       |
| grayscale          | Grayscale strength 0..1 in steps of 0.1                  |
| brightness         | Brigthness strength 0..1 in steps of 0.1                 |
| contrast           | Color contrast strength 0..max in steps of 1             |
| saturate           | Color saturation strength 0..max in steps of 1           |
| sepia              | Sepia strength 0..max in steps of 1                      |
| blur               | Image blur in pixels in steps of 1                       |
| hue                | Color hue rotation in degrees 0..360                     |      
| alt                | Image "alt" text                                         |
| src                | Image URL from where to load image                       |
| loading            | Browser hint how to load image (eager, lazy)             |

<br>
 
## Example
---

**NOTE :**
For more details, check [Image Demo](../../demos/image.html)

```HTML
<gs-image blur="1" sepia="2" src="..."></gs-image>
```
 
<br>

&copy; Green Screens Ltd. 2016 - 2024
