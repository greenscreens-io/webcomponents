# GSTable WebComponent

GSTable WebComponent is  an UI element to define dynamic HTML table which data is loaded and rendered based on [GSSTore](GSStore.md) element and interaction with [GSPagination](GSPagination.md). 

Elements ```<gs-header>``` and ```<gs-store>``` are only top descendant elements allowed. 
All other elements such as ```<gs-pager>``` and ```<gs-context>``` must be "sloted" as shown in example below.

When using different components layout / design, element such as ```<gs-pager>``` can be set out of the ```<gs-table>``` structure. In that case, make sure to use store reference ID so that ```<gs-pager>``` can link its own navigation events to ```<gs-store>```.

<br>

## Attributes
---

| Name               | Description                                              |
|--------------------|----------------------------------------------------------|
| multiselect        | Is multi row select is enabled (bool)                    |
| select             | If row select is enabled. (bool)                         |
| css                | Geenral table CSS                                        | 
| cssSelect          | CSS for selected row                                     | 
| cssHeader          | Table header CSS                                         | 
| cssRow             | Comon CSS for every row                                  | 
| cssCell            | Common CSS for every cell                                | 

<br>

## Example
---
 
**NOTE :** 
For more details, check [Table demo](../../demos/table/)

```html
<gs-table index=false css="table table-light table-hover table-striped user-select-none m-0"
    css-select="table-active table-dark _fw-bold" css-header="user-select-none table-light">
    <gs-header>
        <gs-column name="Name" width="250px" filter="true"></gs-column>
        <gs-column name="Position" width="350px" filter="true"></gs-column>
        <gs-column name="Office" width="200px" filter="true" _list="fixed">
            <gs-item value="" default=true></gs-item>
            <gs-item value="Edinburgh" title="City"></gs-item>
            <gs-item value="London"></gs-item>
            <gs-item value="Tokyo"></gs-item>
            <gs-item value="Sydney"></gs-item>
        </gs-column>
        <gs-column name="Age" width="75px" filter="true"></gs-column>
        <gs-column name="Salary" format="$%s" width="120px"></gs-column>
        <gs-column name="Start date" title="Start Date" format="dd.mm.yyyy" width="130px"></gs-column>
        <gs-column></gs-column>
    </gs-header>
    <gs-store src="data2.json" id="employees" limit=10>
        <gs-item name="Age" type="number"></gs-item>
        <gs-item name="Salary" type="number" format="$\d"></gs-item>
        <gs-item name="Start date" type="date" format="yyyy/mm/dd"></gs-item>
    </gs-store>
    <gs-context slot="extra" target="tbody tr" _template="./templates/context.tpl">
        <gs-item name="Open" action="open"></gs-item>
        <gs-item></gs-item>
        <gs-item name="Submenu">
            <gs-item name="Submenu 1" action="sub_1_1"></gs-item>
            <gs-item name="Submenu 2" action="sub_1_2"></gs-item>
        </gs-item>
    </gs-context>
    <!-- "store" attribute is not required here, use only when gs-pager is placed out of gs-table  -->
    <gs-pager slot="extra" store="employees" previous="&laquo;" next="&raquo;" firstlast="false"></gs-pager>
</gs-table>
```
