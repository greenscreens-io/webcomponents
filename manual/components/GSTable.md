# GSTable WebComponent

GSTable WebComponent is a HTML Table renderer. 

<br>

## Attributes
---

| Name               | Description                                              |
|--------------------|----------------------------------------------------------|
| columns            | JSON Array of table columns                              | 
| data               | JSON Array of data records                               | 
| datacolumn         | If set, first data row i used as a column definition     |
| storage            | GSDataHandler store ID                                   | 
|                    |                                                          |
| filter             | Internal list of filtered records                        |
| selections         | Internal list of selected records                        |
| sort               | Internal list of sorted records                          |
|                    |                                                          |
| color              | Bootstrap standard color for table                       | 
| head-color         | Bootstrap standard color for table header                |
| select-color       | Bootstrap standard color for row selection               |
|                    |                                                          |
| divider            | If set, render divider between header and data           |
| grid               | If set, render table cells bordered                      |
| borderless         | If set, render table without any internal borders        |
| hover              | If set, render hoverable rows                            |
| small              | If set, render table withrow/col spacing                 |
| striped            | If set, render row stripes                               |
| striped-column     | If set, render column stripes                            |
|                    |                                                          |
| multisort          | Allwo multi column soriting                              |
| multiselect        | Allow multi row selection                                |
| protected          | Prevent table data user selection                        |
| selectable         | Allow row selection                                      |
| sortable           | Allow column sorting                                     |

<br>

## Example
---

For more details, check [Table Demo](../../demos/table.html)

```html
<gs-table id="handler" color="light" divider storage="mydata"></gs-table>
```

<br>

&copy; Green Screens Ltd. 2016 - 2024
