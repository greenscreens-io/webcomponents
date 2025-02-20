# GSElement WebComponent

GSElement extended from Lit Element is base WebComponent used by all other Green Screens WebComponent elements. 

<br>

## Attributes - generic attributes across all inherited components
---

| Name               | Description                                           |
|--------------------|-------------------------------------------------------|
| bordered           | If set, will render border around first level node    |
| browser            | Browser  under which to render the element            |
| css                | CSS classes for generated .accordion wrapper          |
| environment        | Environment under which to render the element         |
| flat               | Flag to determine if element use shadow DOM or not    | 
| hide               | Flag to hide element (display:none)                   |
| keep               | Flag to kepp rendered element on the page             |
| locale             | Language ISO code used for translation text content   |
| margin             | Helper for Bootstrap general element margin           |
| onready            | Script to call when the component initially rendered  | 
| os                 | OS under which to render the element                  |
| orientation        | Orientation under which to render the element         |
| padding            | Helper for Bootstrap general element padding          | 
| protocol           | Web protocol under which to render the element        |
| rounded            | If set, will render rounded corners                   |
| rtl                | Flag to determine if element if RTL.                  | 
| shadow             | If set, will render small shadow around component     |
| template           | URL to the template to generate                       |
| theme              | Bootstrap clorig theme name - link element data-theme |

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

<br>

&copy; Green Screens Ltd. 2016 - 2025
