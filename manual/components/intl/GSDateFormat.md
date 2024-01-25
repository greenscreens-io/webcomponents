# GSDateFormat WebComponent

GSDateFormat WebComponent is a plain WebComponent to render date with languagae locale support

<br>

## Attributes 
---

| Name               | Description                                              |
|--------------------|----------------------------------------------------------|
| locale             | Internationl language code format (en-EN)                | 
| value              | Value to format, if not set, current date used           |
| format             | Simple format, if not used, wil ltry 
| data-*             | Optional data from Intl.DateTimeFormat class             |

<br>

List of **data-*** attribute values-


       {
       weekday: 'narrow' | 'short' | 'long',
       era: 'narrow' | 'short' | 'long',
       year: 'numeric' | '2-digit',
       month: 'numeric' | '2-digit' | 'narrow' | 'short' | 'long',
       day: 'numeric' | '2-digit',
       hour: 'numeric' | '2-digit',
       minute: 'numeric' | '2-digit',
       second: 'numeric' | '2-digit',
       timeZoneName: 'short' | 'long',

       // Time zone to express it in
       timeZone: 'Asia/Shanghai',
       // Force 12-hour or 24-hour
       hour12: true | false,

       dateStyle: full | long | medium | short
       timeStyle: full | long | medium | short

       // Rarely-used options
       hourCycle: 'h11' | 'h12' | 'h23' | 'h24',
       formatMatcher: 'basic' | 'best fit'
       }

<br>

## Example
---

**NOTE :** 
For more details, check [date.html](../../demos/intl/date.html)

```html
<gs-date-format locale="hr-HR" format="HH:mm:ss DD.MM.YYYY"></gs-date-format>

<gs-date-format locale="hr-HR" data-dateStyle="full"></gs-date-format>
```
<br>

&copy; Green Screens Ltd. 2016 - 2024
