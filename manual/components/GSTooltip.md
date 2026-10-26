# GSTooltip WebComponent
 
GSTooltip WebComponent is a renderer for Bootstrap Tooltip.
 
## Attributes ```<gs-tooltip>```
---
 
| Name               | Description                                              |
|--------------------|----------------------------------------------------------|
| local              | Search for `target` inside the tooltip's root             |
| opened             | Show the tooltip                                          |
| title              | Tooltip text, or the ID of a `<template>` prefixed by `#` |
| target             | Selector or `@parent`, `@previous`, or `@next` anchor     |
| placement          | Position relative to target (`top`, `bottom`, `start`, `end`, `left`, or `right`) |
| preprocess         | Format text using the supported lightweight Markdown     |
 
<br>

## Example
---
 
**NOTE :**
For more details, check [tooltip.html](../../demos/tooltip.html)
 
```html
<gs-tooltip placement="bottom" title="Bottom" target="#l5"></gs-tooltip>
```

When `preprocess` is enabled, literal HTML in the title is rendered as text;
only the supported formatting markers are interpreted as markup.

<br>

&copy; Green Screens Ltd. 2016 - 2025
