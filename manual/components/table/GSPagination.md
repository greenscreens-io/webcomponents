# GSPagination WebComponent

GSPagination WebComponent is an UI element used for data paging on [GSStore](GSStore.md) element.
Changes on [GSStore](GSStore.md) itself will trigger sotore events resulting in UI updates in [GSTable](GSTable.md)

<br>

## Attributes
---

| Name               | Description                                              |
|--------------------|----------------------------------------------------------|
| pages              | Number of pages button to render for quick navigation    |
| store              | GSStore ID reference, optional.                          |
| first              | Text value to be shown on the button                     | 
| last               | Text value to be shown on the button                     | 
| next               | Text value to be shown on the button                     | 
| previous           | Text value to be shown on the button                     | 
| nextprev           | Should show Next/Prev buttons (bool)                     | 
| firstlast          | Should show First/Last buttons (bool)                    | 

<br>

## Example
---
 
**NOTE :** 
For more details, check [Table demo](../../demos/table/)

When gs-pager used within ```<GS-TABLE>``` tag, make sure ```slot="extra"``` attribute is set.

```html
<gs-pager id="mypager" slot="extra" previous="&laquo;" next="&raquo;" firstlast="false"></gs-pager>
```
<br>

&copy; Green Screens Ltd. 2016 - 2024
