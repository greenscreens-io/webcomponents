# GSLinkExt WebComponent

GSLinkExt WebComponent is an extension of ```<link>``` HTML tag. Purpose is to register CSS style for sharing across all GS WebComponents.
 
GSLinkExt WebComponent does not support style disabling / theming and conditional laoding.

Use it when CSS resource is mandatory.

Loaded CSS is cached inside a **GSCachedStyles** registry, which fires a loading event, signaling already activated Shadow DOM GS WebComponents for a style update.
 
Example to use it:
 
```
<link is="gs-linkext" src=""></link>
```
