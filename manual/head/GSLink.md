# GSLink WebComponent

GSLink WebComponent is a replacement for a ```<link>``` tag, allowing conditional script loading / execution based on conditional attributes.

**NOTE:** For more information about conditional attributes, please refer to [GSBase](./GSBase.md) page.

The only required attribute is **url**. All other attributes from ```<link>``` tag are suported.

The only way to control how the browser will load the script is to use a custom tag instead of extending HTMLScriptElement.

Example usage:
```
<gs-link async="true" defer="true" url="" nonce="" type="text/javascript" os="windows" environment="desktop"></gs-link>
```
<br>

&copy; Green Screens Ltd. 2016 - 2023
