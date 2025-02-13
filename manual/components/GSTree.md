# GSTree WebComponent

GSTree WebComponent is a dynamic tree list component.

GSTree WebComponent extends [GSElement](../base/GSElement.md) and all its attributes and functions.
 
<br>

## Shared Attributes 
---

These attributes are shared between GSTreeElement and GSTreeItemElement.

| Name                 | Description                                              |
|----------------------|----------------------------------------------------------|
| icon-open            | Custom icon when folder is open                          | 
| icon-close           | Custom icon when folder is closed                        | 
| icon-item            | Custom item icon                                         | 
| css-check            | CSS for check box item (multiselect only)                | 
| css-focus            | CSS for focused item                                     | 
| css-selected         | CSS for selected item                                    | 
| check-color          | Color for unchecked item icon  (multiselect only)        | 
| check-color-selected | Color for checked item icon  (multiselect only)          | 


## Tree Attributes 
---


| Name               | Description                                              |
|--------------------|----------------------------------------------------------|
| data               | JSON Array of tree nodes                                 | 
| node               | TreeNode isntacne of tree nodes                          | 
| storage            | GSDataHandler store ID                                   | 
| border             | Render border for each Tree Item                          | 
| leaf               | Prevent selecting "folder" nodes                         | 
| multiselect        | Allow selecting multipel nodes                           | 


## Tree Item Attributes 
---

NOTE: icon-* attributes if set, applies to all nodes unles node has it's own value inplace.

---
| Name               | Description                                                  |
|--------------------|--------------------------------------------------------------|
| icon               | Element icon                                                 |
| color              | Element color                                                |
| title              | Element title                                                |
| opened             | Element is opened                                            |
| selected           | Element is selected                                          |
| url                | Element url (optional)                                       |
| icon-open          | Custom icon when folder is open                              | 
| icon-close         | Custom icon when folder is closed                            | 
| icon-item          | Custom item icon                                             | 

All attributes from [GSSelectableItem](./GSSelectableItem.md).

NOTE: GS-LIST-ITEM supports [GSAttributeHandler](../base/GSAttributeHandler.md) options.

<br>

## Example
---

**NOTE :** 
For more details, check [tree.html](../../demos/tree.html)

```html
<gs-tree>
  <gs-item title="Item 1" data-path="/test">
    <gs-item title="Item 2"></gs-item>
    <gs-item title="Item 3">
      <gs-item title="Item 4"></gs-item>
      <gs-item title="Item 5"></gs-item>
    </gs-item>        
  </gs-item>  
</gs-tree>
```
<br>

&copy; Green Screens Ltd. 2016 - 2025
