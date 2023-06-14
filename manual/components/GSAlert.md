# GSAlert WebComponent

GSAlert WebComponent is a Bootstrap Alert renderer which allows template injection from external source.

GSAlert WebComponent extends [GSElement](../base/GSElement.md) and all its attributes and functions.

<br>

## Attributes 
---

| Name               | Description                                              |
|--------------------|----------------------------------------------------------|
| css                | CSS classes for alert content                            |
| css-active         | CSS classes for visible alert                            |
| delay              | If billboad mode, text iteration delay in seconds        | 
| dismisaable        | Add / remove dismiss button, to close alert              |
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
    <gs-item title="Message 1"></gs-item>
    <gs-item title="Message 2"></gs-item>
    <gs-item title="Message 3"></gs-item>
</gs-alert>
```
