# GSScript WebComponent

GSScript WebComponent is a replacement for a ```<script>``` tag, allowing conditional script loading / execution based on conditional attributes.

**NOTE:** For more information about conditional attributes, please refer to [GSBase](./GSBase.md) page.

The only required attribute is **url**.

The only way to control how the browser will load the script is to use a custom tag instead of extending HTMLScriptElement.

Example usage:
```
<gs-script async="true" defer="true" url="" nonce="" os="windows" environment="desktop"></gs-script>
```