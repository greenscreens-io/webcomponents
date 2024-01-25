# GSAlert WebComponent

GSAlert WebComponent is a Bootstrap Alert renderer which allows template injection from external source.
If multiple gs-item elements , billboard is activated to automatically switch text messages.

GSAlert WebComponent extends [GSElement](../base/GSElement.md) and all its attributes and functions.

<br>

## Attributes 
---

| Name               | Description                                              |
|--------------------|----------------------------------------------------------|
| color              | Alert color (bootstrap colors)                           |
| delay              | If billboard mode, text iteration delay in seconds       | 
| closed             | Hide alert                                               |
| closable           | Add / remove dismiss button, to close alert              |
| message            | Content message                                          | 

<br>

## Example
---

**NOTE :** 
For more details, check [alert.html](../../demos/alert.html)

```html
<!-- simple alert with text message -->
<gs-alert css="btn-primary" css-active="fade" message="focus hover" dismissable="true"></gs-alert>

<!-- alert with template message -->
<gs-alert css="btn-primary" css-active="fade" dismissable="true">
    <slot>
        <gs-template href="//content.html"></gs-template>
    </slot>
</gs-alert>

<!-- alert with injectable html -->
<gs-alert css="btn-primary" css-active="fade" dismissable="true">
    <slot>
        <div>...some html code ...</div>
    </slot>
</gs-alert>

<gs-alert css="btn-primary" css-active="fade" message="focus hover" dismissable="true" delay="5">
    <gs-item message="Message 1"></gs-item>
    <gs-item message="Message 2"></gs-item>
    <gs-item message="Message 3"></gs-item>
</gs-alert>
```

<br>

&copy; Green Screens Ltd. 2016 - 2024
