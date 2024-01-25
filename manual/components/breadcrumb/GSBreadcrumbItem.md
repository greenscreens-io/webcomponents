# GSBreadcrumbItem WebComponent

GSBreadcrumbItem WebComponent represent UI for a single breadcrumb element.


<br>
## Attributes
---
 
| Name               | Description                                                  |
|--------------------|--------------------------------------------------------------|
| data               | JSON array representing items to render                      |
| color              | Bootstrap text colors (primary, secondary...)                |
| divider            | Bootstrap icon name used as a divider                        |
| spacing            | Spacing between items (Bootstrp margin values 1..5)          |

NOTE: Color, divider and spacing if not set, are reflected from gs-breadcrumb.

**NOTE:**

AttributeController is attached to support gs-* clicable actions.
 
Please refer to the [AttributeController](../base/AttributeController.md) for attributes click handling options.
 
<br>
 
## Slots
---

| Name               | Description                                              |
|--------------------|----------------------------------------------------------|
| prefix             | Place HTML content before item                           |
| suffix             | Place HTML content after item                            |
| separator          | Place HTML content isnted of default separator icon      |

<br>

## Example
---

```html
<gs-breadcrumb-item>Home</gs-breadcrumb-item>
```

<br>

&copy; Green Screens Ltd. 2016 - 2024
