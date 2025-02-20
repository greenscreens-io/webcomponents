# GSCurrencyFormat WebComponent

GSCurrencyFormat WebComponent is a plain WebComponent to render currrency value with languagae locale support

<br>

## Attributes 
---

| Name               | Description                                              |
|--------------------|----------------------------------------------------------|
| currency           | International 3 letter currency (JPY, etc.)              |
| locale             | International language format (en-EN, etc)               | 
| value              | Numeric value to format nnnnn.nnn etc.                   |
| data-*             | Optional data from Intl.DateTimeFormat class            |

<br>

## Example
---

**NOTE :** 
For more details, check [currency.html](../../demos/intl/currency.html)

```html
<gs-currency-format language="en-EN", curreny="JPY" value="123456.789"></gs-currency-format>
```

<br>

&copy; Green Screens Ltd. 2016 - 2025
