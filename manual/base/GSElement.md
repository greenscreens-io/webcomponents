# GSElement class
 
The GSElement class is a core for all GS UI WebComponents.
 
For more info, please refer to **GSElement** API doc.
 
NOTE: Please see [Install](../install.md) document for instructions on how to generate API manuals.

<br>
 
## Attributes
---
 
| Name               | Description                                                   |
|--------------------|---------------------------------------------------------------|
| anchor             | Where to attach child elements when Shadow DOM not used       |
| environment        | Element will render only under specified environment          |
| flat               | Element will not use Shadow DOMif set to 'true'               |
| onready            | Function to be called afre render                             |
| orientation        | Element will render only under specified orientation          |
| os                 | Element will render only under specified OS (window, linux)   |
| template           | Element external template                                     |
 
<br>

 - **environment** 
	*  blank - always render
	*  mobile - only on mobile devices
	*  tablet - only on tablet devices
	*  desktop - only on desktop devices

- **orientation** 
    *  blank - always render
    *  vertical - only when screen width is smaller than height
	*  horizontal - only on screen height is smaller than width

- **os** 
    *  blank - always render
    *  apple - render on Mac OS            
    *  linux - render on Linux OS
    *  windows - render on MS Windows OS