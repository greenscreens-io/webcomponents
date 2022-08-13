# GSCSS WebComponent

GSCSS WebComponent is a flexible CSS loader component, a replacement for ```<link>``` tag.

Major difference between ```<link is="ga-linkext">``` and ```<gs-css>``` is that this component supports theme change, conditional rendering. 

**NOTE:** For more information about conditional attributes, please refer to [GSBase](./GSBase.md) page.

Once SCS style is loaded and cached, this element is automatically removed from the page, unless **active** attribute ussd for dynamic theming.


Example usage:

```
<gs-css url="" global="true" active="true"></gs-css>
```
