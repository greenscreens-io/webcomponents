# GSBreadcrumb WebComponent

GSBreadcrumb WebComponent is a wrapper around Bootstrap breadcrum UI.
    
<br>
## Attributes
---
 
| Name               | Description                                                  |
|--------------------|--------------------------------------------------------------|
| storage            | Reference id to data storage for rendering items             |
| data               | JSON array representing items to render                      |
| color              | Bootstrap text colors (primary, secondary...)                |
| divider            | Bootstrap icon name used as a divider                        |
| spacing            | Spacing between items (Bootstrp margin values 1..5)          |

NOTE: Color, dividerand spacing are reflected to generate items. 

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

&copy; Green Screens Ltd. 2016 - 2024
