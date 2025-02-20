# GSCard WebComponent

GSCard WebComponent is a wrapper around Bootstrap cart layout.

<br>

## Attributes
---

| Name               | Description                                              |
|--------------------|----------------------------------------------------------|
| color-text         | Bootstrap color for card text                            |
| color-back         | Bootstrap color for card background                      |
| color-border       | Bootstrap color for card border                          |

| css-title          | CSS classes for card title                               |
| css-subtitle       | CSS classes for card subtitle                            |
| css-header         | CSS classes for card header                              |
| css-footer         | CSS classes for card footer                              |
| css-body           | CSS classes for card body                                |
| css-image          | CSS classes for image                                    |
| css-text           | CSS classes for inner text                               |

| image-style        | JSON format for img css style                            |

| footer             | Card footer text                                         |
| header             | Card header text                                         |
| subtitle           | String for card subtitle                                 |
| title              | String for card title                                    |
| text               | Card content text                                        |

| align              | Content align (start/end/center)                         |
| image              | Image URL                                                |
| overlay            | Flag to use Iiamge as an overlay (footr/header not used) |
| placement          | Image placement (start/end/top/bottom)                   |

<br>
 
## Slots
---

| Name               | Description                                              |
|--------------------|----------------------------------------------------------|
| title              | Place HTML content into title position                   |
| subtitle           | Place HTML content into subtitle position                |
| text               | Place HTML content into body position                    |
| image              | Place HTML content into image position                   |
| header             | Place HTML content into header position                  |
| footer             | Place HTML content into footer position                  |

<br>

## Example
---
 
**NOTE :** 
For more details, check [card.html](../../demos/card.html)

```html
<gs-card css="mx-1" border align="start" css-header="fw-bold fs-2" header="Header" title="Primary card title" text="Some quick example text to build on the card title and make up the bulk of the card's content.">
   <gs-button slot="body" title="Go somewhere" color="primary" icon="clock"></gs-button>
</gs-card>
```
<br>

&copy; Green Screens Ltd. 2016 - 2025
