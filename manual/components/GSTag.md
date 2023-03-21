# GSTag WebComponent

GSTag WebComponent is a dynamictag list input composite component.

GSTag WebComponent extends [GSElement](../base/GSElement.md) and all its attributes and functions.

<br>

## Attributes 
---

| Name               | Description                                              |
|--------------------|----------------------------------------------------------|
| css                | CSS classes for alert content                            |
| css-close          | CSS close button for a tag                               | 
| css-tag            | CSS for a tag                                            | 
| allowadd           | Allow custom values                                      | 
| max                | Maximum nuimber of entries                               | 
| palceholder        | Text to display in input field                           | 
| values             | List of default or selected tag values                   | 

<br>

## Example
---

**NOTE :** 
For more details, check [tags.html](../../demos/tags.html)

```html
    <gs-tag name="browsers" values="Chrome,Edge,Firefox" max="5" allowadd="true">
      <gs-item name="Chrome"></gs-item>
      <gs-item name="Edge"></gs-item>
      <gs-item name="Firefox"></gs-item>
      <gs-item name="Safari"></gs-item>
      <gs-item name="Internet Explorer"></gs-item>
    </gs-tag>
```
