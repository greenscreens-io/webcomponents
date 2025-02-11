# GSDataListExt WebComponent
 
GSDataListExt WebComponent is an extension of a standard HTMLDataListElement element that adds automatic JSON data loading and items self generation.
 
## Example
---
Input field names "type" is linked to a **<datalist>** named **types**. When **<datalist>** is loaded with the data, the input field will become an editable ComboBox.
 
```html
<input type="text" list="types" name="type" class="form-control">
<datalist id="types" is="gs-ext-datalist" data="datalist.json"></datalist>
```
<br>

Use storage to generate an unique list of selectable values from provided record field. 
The property "key" is used to select record field name or column number if data is a simple array.

```html
<input type="text" list="types" name="type" class="form-control">
<datalist id="types" is="gs-ext-datalist" key="name" storage="data"></datalist>
```
<br>

&copy; Green Screens Ltd. 2016 - 2025
