# GSScript WebComponent

GSScript WebComponent is a replacement for a ```<script>``` tag, allowing conditional script loading / execution based on conditional attributes.

When using external templates with script tag, it is recommended to use GSScript inatead as it has internal control to prevent multiple script load / initialze.
For example, if there is as custom JavaScript Class loaded with template. Multiple tempalte activation for native ```<script>``` tag will throw an error.

**NOTE:** For more information about conditional attributes, please refer to [GSBase](./GSBase.md) page.

All other attributes from ```<link>``` tag are suported.

The only way to control how the browser will load the script is to use a custom tag instead of extending HTMLScriptElement.

## Example:
---

Load standard JavaScript

```html
<gs-script url="script.js"></gs-script>
```

Load standard JavaScript as async and defered 

```html
<gs-script async="true" defer="true" url="script.js"></gs-script>
```

Load module JavaScript.

```html
<gs-script type="module" url="script.js"></gs-script>
```

JavaScript conditional loading .

```html
<gs-script os="windows" environment="desktop" url="script.js"></gs-script>
```

JavaScript code signature protected 

```html
<gs-script url="script.js" nonce="a8eca86f63bc63ca73ca02"></gs-script>
```

For repeatable JavaScript loading.  Use it if script must be injected with template.

```html
<gs-script auto="false" url="script.js"></gs-script>
```
<br>

&copy; Green Screens Ltd. 2016 - 2023
