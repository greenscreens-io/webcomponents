# GSCSS WebComponent

GSCSS WebComponent is a flexible CSS loader component, a replacement for ```<link>``` tag.

Major difference between ```<link is="ga-linkext">``` and ```<gs-css>``` is that this component supports theme change and conditional rendering. 

**NOTE:** For more information about conditional attributes, please refer to [GSBase](./GSBase.md) page.

Once SCS style is loaded and cached, this element is automatically removed from the page, unless **active** attribute ussd for dynamic theming.

<br><br>

## Attributes
---

| Name           | Description                                                                   |
|----------------|-------------------------------------------------------------------------------|
| disabled       | Disable th style. Dynamicale adds or removes from all Shadow dom elements.    |
| order          | Sortable value, order in stylecache list.                                     |
| notheme        | If set to true, theme switcher will ignore this style (considered mandatory). |
| theme          | Theme name. Used in combination with hashtag to switch themes.                |

<br><br>

## Example usage:
---

Standard CSS injection to a document and all Shadow DOM elements.
```
<gs-css src="/webcomponents/assets/css/theme.css"></gs-css>
```
<br>

CSS injection excluded from theme switcher.
```
<gs-css src="/webcomponents/assets/icons/bootstrap-icons.css" notheme="true"></gs-css>  
```

<br>

CSS injection based on theme name.

In page URL add **hashtag** with theme name...

```
https://localhost/app.html
https://localhost/app.html#theme=dark
https://localhost/app.html#theme=lite
```

```
<gs-css src="/webcomponents/assets/css/bootstrap.css" theme="default"></gs-css>
<gs-css src="/webcomponents/assets/css/custom_dark.css" theme="dark"></gs-css>
<gs-css src="/webcomponents/assets/css/custom_lite.css" theme="lite"></gs-css>
```

<br>

&copy; Green Screens Ltd. 2016 - 2023
