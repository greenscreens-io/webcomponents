# GSTree WebComponent

GSTree WebComponent is a dynamic tree list component.

GSTree WebComponent extends [GSElement](../base/GSElement.md) and all its attributes and functions.

<br>

## Attributes 
---

| Name               | Description                                              |
|--------------------|----------------------------------------------------------|
| css                | CSS classes for the tree                                 |
| item-icon          | Custom icon for a leaf item                              |
| open-icon          | Custom icon when a folder is open                        |
| close-icon         | Custom icon when a folder is closed                      |
| open               | Indicates that a folder starts open (on `gs-item`)       |

<br>
## Events

For cancelable events, call e.preventDefault() to cancel operations (closing a modal for example).

---
| Name               | Description                                                  |
|--------------------|--------------------------------------------------------------|
| close              | Folder is closed                                             |
| open               | Folder is opened                                             |
| select             | Element is selected                                          |
| action             | Element action trigger                                       |

<br>

## Example
---

**NOTE :** 
For more details, check [tree.html](../../demos/tree.html)

```html
<gs-item css="" action="" target="" toggle="" target="" dismiss="" title="Item 1">
  <gs-item css="" action="" target="" toggle="" target="" dismiss="" title="Item 2"></gs-item>
  <gs-item css="" action="" target="" toggle="" target="" dismiss="" title="Item 3">
    <gs-item css="" action="" target="" toggle="" target="" dismiss="" title="Item 4"></gs-item>
    <gs-item css="" action="" target="" toggle="" target="" dismiss="" title="Item 5"></gs-item>
  </gs-item>        
</gs-item>  
```
<br>

&copy; Green Screens Ltd. 2016 - 2023
