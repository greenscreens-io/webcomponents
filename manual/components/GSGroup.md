# GSGroup WebComponent
 
GSGroup WebComponent handles grouped elements navigation, selection and focus for various components such as Buttons, Lists, Navs and Tabs.
 
<br>
 
## Attributes 
---
 
| Name               | Description                                              |
|--------------------|----------------------------------------------------------|
| circular           | Allow circular rotation for selection                    |
| multiple           | Allow multiple selections                                |
| group              | Allow single selection across multiple lists.            |
| storage            | Load list items from JSON storage.                       |
| data               | Load list items from JSON data.                          |

## Events 
---
 
| Name               | Description                                              |
|--------------------|----------------------------------------------------------|
| group-reset        | Trigger when position is reset to the first element      |
| group-focused      | Trigger when navigable element is focused                |
| group-selected     | Trigger when navigable element is selected               |
| group-deselected   | Trigger when navigable element is deselected             |

<br>

## Custom controllers

To register a custom controller, use getter "isNavigation" 

```JavaScript
class MyController {
    get isNavigation() {return true};
    onReset(el) {}
    onFocused(el) {}
    onDeselected(el) {}
    onSelected(el) {}
}
```

<br>

## Example
---
 
**NOTE :**
For more details, check [Button Group Demo](../../demos/button.html)
 
```html
<gs-group css="btn-group">
    <gs-button title="1"></gs-button>
    <gs-button title="2"></gs-button>
    <gs-button title="3"></gs-button>
</gs-group>
```

<br>

&copy; Green Screens Ltd. 2016 - 2025
