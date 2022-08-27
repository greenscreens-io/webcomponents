# GSTime WebComponent

GSTime WebComponent is a simple curernt time renderer.

<br>

## Attributes 
---

| Name               | Description                                              |
|--------------------|----------------------------------------------------------|
| interval           | Interval in second to update data                        |
| locale             | Language locale for time format                          | 

<br>

## Example
---

```html
<gs-time interval="10" locale="hr"></gs-time>

<!--  use css to hide from ui if needed -->
<gs-time interval="10" locale="hr" class="d-none"></gs-time>
```

Use event triggering to call method every interval.

```JavaScript
const time = GSComponents.find('gs-time');
time.once('time', e => console.log(e));
time.on('time', e => console.log(e));
```
