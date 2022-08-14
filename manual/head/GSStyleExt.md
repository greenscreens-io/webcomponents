# GSStyleExt WebComponent
 
GSStyleExt WebComponent is an extension of ```<style>``` HTML tag. Purpose is to register CSS style for sharing across all GS WebComponents Shadow DOM.
 
GSStyleExt WebComponent does not support style disabling / theming and conditional loading.

Use it when CSS resource is mandatory.

Style is cached inside a **GSCachedStyles** registry, which fires a loading event, signaling already activated Shadow DOM GS WebComponents for a style update.

Example to use it:
 
```
<style is="gs-styleext">
    ... some css ...
</style>
```
