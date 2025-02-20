# GSHighlight WebComponent

GSHighlight WebComponent is a HLJ library renderer to highlight source code on a page.

GSHighlight WebComponent load scripts from CDN by default. 
If scripts are distributed localy, use **self.GS_URL_HLJS** global variable before loading GSHighlight WebComponent.

<br>

## Attributes ```<gs-highlight>```
---

| Name               | Description                                         |
|--------------------|-----------------------------------------------------|
| language           | Data language, if not set, autodetect is used       |
| target             | CSS selector from which to take innerHTML as source |
| theme              | One of HLJS color themes                            |
| url                | URL address from which to load source data          |

NOTE: Either target or url can be used.

<br>

## Example
---

**NOTE :** 
For more details, check [highlight.html](../../demos/extra/GSHighlight.html)

Loading data from remote resource.

```html
<gs-highlight url="index.html"></gs-highlight>
```

Loading data from page element.

```html
<gs-highlight target="#demo"></gs-highlight>
```

<br>

&copy; Green Screens Ltd. 2016 - 2025
