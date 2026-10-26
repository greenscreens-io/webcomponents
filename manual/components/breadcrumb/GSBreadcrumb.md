# GSBreadcrumb WebComponent

GSBreadcrumb WebComponent is a wrapper around Bootstrap breadcrum UI.
    
<br>
## Attributes
---
 
| Name               | Description                                                  |
|--------------------|--------------------------------------------------------------|
| storage            | Reference id to data storage for rendering items             |
| data               | Array of item objects (`$text`, `href` or `url`, and optional attributes) |
| color              | Bootstrap text colors (primary, secondary...)                |
| divider            | Bootstrap icon name used as a divider                        |
| spacing            | Spacing between items (Bootstrp margin values 1..5)          |

NOTE: Color, divider, and spacing are applied to generated items. Per-item data
can override these values; spacing `0` and an empty divider are supported.

<br>

## Example
---

**NOTE :**
For more details, check [Breadcrumb Demo](../../demos/breadcrumb.html)

```html
<gs-breadcrumb color="danger" spacing="1" divider="bicycle">    
    <gs-breadcrumb-item>Home</gs-breadcrumb-item>
    <gs-breadcrumb-item>About</gs-breadcrumb-item>
    <gs-breadcrumb-item href="/contact.html">Contact</gs-breadcrumb-item>
</gs-breadcrumb>
```

<br>

&copy; Green Screens Ltd. 2016 - 2025
