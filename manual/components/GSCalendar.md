# GSCalendar WebComponent

GSCalendar WebComponent is a month selector renderer.

<br>

## Attributes
---

| Name               | Description                                              |
|--------------------|----------------------------------------------------------|
| css                | CSS classes for content                                  |
| css-header         | CSS classes for title header                             |
| css-month          | CSS classes for Month name                               |
| css-year           | CSS classes for Year                                     |
| css-nav            | CSS classes for month navigation                         |
| css-days           | CSS classes for days row                                 |
| css-weeks          | CSS classes for weeks bar                                |
| css-selected       | CSS classes for selected day                             |
| css-today          | CSS classes for current day                              |
| date               | Initial date                                             |
| format             | String format the date                                   |
| locale             | Local language support                                   |

<br>

## Example
---
 
**NOTE :** 
For more details, check [calendar.html](../../demos/calendar.html)

```html
<gs-calendar date="" css="" format="dd.mm.yyyy" locale="hr"></gs-calendar>
```
How to listen for date slection:

```JavaScript
const el = GSComponents.find('gs-calendar');
el.listen('date', e => console.log(e));
```
