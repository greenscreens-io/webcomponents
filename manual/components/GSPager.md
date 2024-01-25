# GSPager WebComponent

GSPager WebComponent is a component for table data navigation. Component autoamtically links itself to the GSDatahandler / GSStore and issue data page navigation requests.

<br>
 
## Attributes
 
| Name               | Description                                                     |
|--------------------|-----------------------------------------------------------------|
| storage            | Data handler or storage ID to reference to.                     |
| color              | Bootstrap colors for button color.                              | 
| size               | Bootstrap size value to define UI size (small, large, default)  | 
| first              | If set, first button is rendered.                               | 
| last               | If set, last button is rendered.                                | 
| next               | If set, next button is rendered.                                | 
| previous           | If set, previous button is rendered.                            | 
| pages              | Number of pages to show                                         | 
| label-first        | Display text for "first" page button.                           | 
| label-last         | Display text for "last" page button.                            | 
| label-next         | Display text for "next" page button.                            | 
| label-previous     | Display text for "previous" page button.                        | 
| css-item           | CSS classes to apply to button elements                         | 

<br>

## Example
---
 
**NOTE :** 
For more details, check [Pagination demo](../../demos/pagination.html)


```html
<gs-pagination storage="mystore"></gs-pagination>
```

<br>

&copy; Green Screens Ltd. 2016 - 2024
