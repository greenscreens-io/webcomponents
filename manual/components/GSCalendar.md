# GSCalendar WebComponent

GSCalendar WebComponent is a month selector renderer.

<br>

## Attributes
---

| Name               | Description                                              |
|--------------------|----------------------------------------------------------|
| css                | CSS classes for content                                  |
| css-header         | CSS classes for title header                             |
| css-nav            | CSS classes for month navigation                         |
| css-day            | CSS classes for day element                              |
| css-week           | CSS classes for weeks bar                                |
| date               | Initial date                                             |

<br>

## Example
---
 
**NOTE :** 
For more details, check [calendar.html](../../demos/calendar.html)

```html
<gs-calendar date="" css=""></gs-calendar>
```
How to listen for date slection:

```JavaScript
const el = GSComponents.find('gs-calendar');
el.listen('date', e => consonle.log(e));
```