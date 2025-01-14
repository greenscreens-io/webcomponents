# GSFileBox WebComponent

GSFileBox is a drag&drop file selector element.

<br>

## Attributes

| Name      | Description                             |
|-----------|-----------------------------------------|
| css       | CSS class for main component frame      |
| css-input | CSS class for input field (d-none)      |
| css-label | CSS class for component info            |
| css-list  | CSS class for a list of selected files  |
| accept    | The same as input accept attribute      |
| directory | Select directory or file/s (boolean) |
| filter    | Regex to filter file mime type          |
| multiple  | Allow multiple file selection (boolean) |
| name      | Input field name & ID                   |
| title     | Info 'Drag-drop or click to select'     |


<br>

## Events
---

Component triggers event 'accepted' when file is matched **filter** attribute.

<br>

## Examples
---

Basic element definition withing a page.

**NOTE :** 
For more details, check [filebox.html](../../../demos/filebox.html)

```html
<gs-filebox name="file"></gs-filebox>
<gs-filebox name="file" multiple></gs-filebox>
<gs-filebox name="file" directory></gs-filebox>
```

<br>

```JavaScript
const fileBox = GSDOM.query('gs-filebox');
fileBox.listen('accept', e => console.log(e));
```
<br>

&copy; Green Screens Ltd. 2016 - 2025
