# GSComboExt WebComponent
 
GSComboExt WebComponent is an extension of a standard HTMLSelectElement that adds automatic JSON data loading and selectable items self generation.
 
## Example
---
 
```html
<select is="gs-ext-select" url="data.json"  name="type" class="form-control"></select>
```

Use storage to generate an unique list of selectable values from provided record field. 
The property "key" is used to select record field name or column number if data is a simple array.

```html
<select is="gs-ext-select" key="name" storage="data"></select>
```
<br>

<br>

&copy; Green Screens Ltd. 2016 - 2025
