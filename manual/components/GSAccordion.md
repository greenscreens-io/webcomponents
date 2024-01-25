# GSAccordion WebComponent

GSAccordion WebComponent is a Bootstrap Accordion renderer which allows template injection from external source.

GSAccordion WebComponent extends [GSElement](../base/GSElement.md) and all its attributes and functions.

<br>

## Attributes ```<gs-accordion>```
---

| Name               | Description                                         |
|--------------------|-----------------------------------------------------|
| autoclose          | When set will allow only one item opened            |
| border             | Helper flag to set accordion border                 |
| shadow             | Helper flag to set accordion shadow                 |
| css                | CSS classes for generated accordion                 |
| css-item           | CSS classes for gs-item element container           | 
| css-body           | CSS classes for accordion item content wrapper      |
| css-header         | CSS classes for accordion header title              |

<br>

## Attributes ```<gs-item>```
---

| Name               | Description                                                 |
|--------------------|-------------------------------------------------------------|
| message            | Item content, might be a text, id-ref or template path      | 
| title              | Item title                                                  |
| template           | Template url or ID for item content                         |
| opened             | Is item initially opened or closed                          |

<br>

## Example
---

**NOTE :** 
For more details, check [accordion.html](../../demos/accordion.html)

```html
<template id="content">
    ... some html code ...
</template>
<gs-accordion css="" css-item="" css-header="" css-body="" autoclose>
    <gs-item title="Simple" message="My content message" opened ></gs-item>
    <gs-item title="ID Reference" message="#content"></gs-item>
    <gs-item title="Template content" message="//content.html"></gs-item>
</gs-accordion>
```
<br>

&copy; Green Screens Ltd. 2016 - 2024
