# GSYearFormat WebComponent

GSYearFormat WebComponent is a simple renderer which renders current year in a page.

Useful for copyright notices etc.

<br>

## Attributes 
---

| Name               | Description                                              |
|--------------------|----------------------------------------------------------|
| offset             | Positive ore negative number offsetting curent year      | 

<br>

## Example
---

**NOTE :** 
For more details, check [year.html](../../demos/intl/year.html)

Shows current years

```html
<gs-year-format></gs-year-format>
```

Shows five years in the future from oow

```html
<gs-year-format offset="5"></gs-year-format>
```

Shows five years in the past from oow

```html
<gs-year-format offset="-5"></gs-year-format>
```