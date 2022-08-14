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
| directory | Select directory or of file/s (boolean) |
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

```html
<gs-filebox name="file"></gs-filebox>
<gs-filebox name="file" multiple="true"></gs-filebox>
<gs-filebox name="file" directory="true"></gs-filebox>
```

<br>

```JavaScript
const fileBox = document.querySelector('gs-filebox');
fileBox.listen('accept', e => console.log(e));
```