# GSEmail WebComponent
 
GSEmail WebComponent is a wrapper around standard HTMLAnchor element to show clickable email address protected from scanning by spam bots.
  
Once attributes are set, they are internally copied and automatically removed from 
<br>
 
## Attributes
---
 
| Name               | Description                                              |
|--------------------|----------------------------------------------------------|
| user               | Email identifier                                         |
| domain             | Email domain address                                     |
| dev                | Enable development mode to show stored data              |

<br>
 
## Example
---

```HTML
<gs-email dev domain="greenscreens.io" user="info"></gs-email>
<gs-email data-domain="oi.sneercsneerg" data-user="ofni"></gs-email>
```
 
<br>

&copy; Green Screens Ltd. 2016 - 2025
