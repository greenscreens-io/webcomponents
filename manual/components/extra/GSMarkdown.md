
# GSMarkdown WebComponent

GSMarkdown WebComponent is a mmarkdown laoder and renderer based on 3rd party library.

GSMarkdown WebComponent load scripts from CDN by default. 
If scripts are distributed localy, use **self.GS_URL_MARKDOWN** global variable before loading GSHighlight WebComponent.

<br>

## Attributes ```<gs-monaco>```
---

| Name               | Description                                         |
|--------------------|-----------------------------------------------------|
| css                | CSS classes to apply to internal element            |
| url                | URL address from which to load source data          |
| history            | Number of navigation levels rememberd               |
| max-height         | Maximum height allowed                              |


<br>

## Example
---

**NOTE :** 
For more details, check [markdown.html](../../demos/extra/GSMarkdown.html)

Loading data from remote resource.

```html
<gs-markdown url="main.md"></gs-markdown>
```

<br>

&copy; Green Screens Ltd. 2016 - 2025
