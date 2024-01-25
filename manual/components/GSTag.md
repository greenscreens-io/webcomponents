# GSTag WebComponent

GSTag WebComponent is a dynamictag list input composite component.

GSTag WebComponent extends [GSElement](../base/GSElement.md) and all its attributes and functions.

<br>

## Attributes 
---

| Name               | Description                                              |
|--------------------|----------------------------------------------------------|
| css-close          | CSS close button for a tag                               | 
| css-tag            | CSS for a tag                                            | 
| color              | CSS for a tag                                            | 
| close-color        | Tag close button color                                   | 

| max                | Maximum number of entries                                | 
| size               | Tag icon size                                            | 
| name               | input element bname - used on forms                      | 
| appendable         | Allow custom values                                      | 
| placeholder        | Text to display in input field                           | 

| values             | List of default or selected tag values                   | 
| data               | List values available in select box                      | 

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

<br>

&copy; Green Screens Ltd. 2016 - 2024
