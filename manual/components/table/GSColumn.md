# GSColumn WebComponent

GSColumn WebComponent is an UI element to define [GSTable](GSTable.md) data column and header.

<br>

## Attributes
---

| Name               | Description                                              |
|--------------------|----------------------------------------------------------|
| name               | Data field name to map                                   |
| title              | Header title. If not set, data field name will be used.  |
| filter             | Enable input box for column fitlering (bool)             | 
| format             | Visual data formating, supported for dates and numbers   | 
| sortable           | Is column sorting enabled. (bool)                        | 
| width              | Optional column width (CSS)                              | 
| css                | Data column CSS                                          | 
| css-filter         | Filter column CSS                                        | 
| css-header         | Header column CSS                                        | 

<br>

NOTE: When column name is set to ***name="#"***, column is considered as record counter.

<br>

## Example
---
 
**NOTE :** 
For more details, check [Table demo](../../demos/table/)

Column with custom title

```html
<gs-column title="Name" name="desc" width="250px" filter="true"></gs-column>
```

Column with title equal to data field name
```html
<gs-column name="Name" width="250px" filter="true"></gs-column>
```

Column with filterable list 
```html
<gs-column name="Office" width="200px" filter="true" sortable="true">
    <gs-item value="" default=true></gs-item>
    <gs-item value="Edinburgh" title="City"></gs-item>
    <gs-item value="London"></gs-item>
    <gs-item value="Tokyo"></gs-item>
    <gs-item value="Sydney"></gs-item>
</gs-column>
```