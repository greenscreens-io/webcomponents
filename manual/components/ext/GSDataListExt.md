# GSDataListExt WebComponent
 
GSDataListExt WebComponent is an extension of a standard HTMLDataList element that adds automatic JSON data loading and items self generation.
 
## Example
---
Input field names "type" is linked to a **<datalist>** named **types**. When **<datalist>** is loaded with the data, the input field will become an editable ComboBox.
 
```
<input type="text" list="types" name="type" class="form-control">
<datalist id="types" is="gs-ext-datalist" data="datalist.json"></datalist>11
```

