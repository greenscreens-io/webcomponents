# GSMonaco WebComponent

GSMonaco WebComponent is a MS Monaco editor library loader for web based source code editing.

GSMonaco WebComponent load scripts from CDN by default. 
If scripts are distributed localy, use **self.GS_URL_MONACO** global variable before loading GSHighlight WebComponent.

<br>

## Attributes ```<gs-monaco>```
---

| Name               | Description                                         |
|--------------------|-----------------------------------------------------|
| css                | CSS classes to apply to internal element            |
| language           | Data language, if not set, autodetect is used       |
| target             | CSS selector from which to take innerHTML as source |
| theme              | One of HLJS color themes                            |
| url                | URL address from which to load source data          |

<br>

## Example
---

**NOTE :** 
For more details, check [monaco.html](../../demos/extra/GSMonaco.html)

Loading data from remote resource.

```html
<gs-monaco url="monaco.html" language="html" class="flex-fill d-flex" css="flex-fill"></gs-monaco>
```
