# GSTab GSTabGroup
 
GSTab GSTabGroup is a renderer for Bootstrap Tab Panel
 
## Attributes ```<gs-tab>```
---
 
| Name               | Description                                              |
|--------------------|----------------------------------------------------------|
| css-nav            | CSS class for tab item                                   |
| css-panel          | CSS class for tab panel body                             |
| card               | If true, render as Bootstrap card tab panel              |
| placement          | Tab buttons placement (start,end,top, bottom)            |
| type               | Tab type (pills, tabs, underline )                       |
 
<br>
 
## Attributes ```<gs-item>```
---
 
| Name               | Description                                              |
|--------------------|----------------------------------------------------------|
| css-nav            | CSS class for tab item                                   |
| css-panel          | CSS class for tab panel body                             |
| css-nav-wrap       | CSS class for tab item wrapper                           |
| active             | Mark panel active / selected                             |
| icon               | Tab panel button icon                                    |
| title              | Tab panel title                                          |
| template           | Tab panel content loaded from external resource          |
 
 
## Example
---
 
**NOTE :**
For more details, check [Tab Demo](../../demos/tab/)
 
```html
<gs-tab css="m-4 p-1 bg-light border shadow-sm" css-nav="nav-tabs nav-pills" css-panel="">
    <gs-item title="Home"  template="//content.tpl" css-nav="nav-pill active" css-pane=""></gs-item>
    <gs-item title="Test1" flat="true" template="//content2.tpl" icon="alarm ms-1"></gs-item>
    <gs-item title="Test2" template="#test"></gs-item>
    <gs-item title="Blog" css-nav="" css-panel="">
            <!--
                This is internal text to be shown in tab panel
            -->
    </gs-item>
    <gs-item title="Contact" css-nav="" css-panel="">
        <h1>This is internal text to be shown in tab panel</h1>
    </gs-item>
</gs-tab>
```
 
<br>

&copy; Green Screens Ltd. 2016 - 2024
