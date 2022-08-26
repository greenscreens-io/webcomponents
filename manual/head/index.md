# Green Screens Header library
 
Header library contains WebComponents injectable into a document ```<head>``` block.
 
These components are written to be completely independent from other parts of the library and can be used as standalone elements.
 
The main purpose for this set of components is to enable conditional resource loading. For example, to load specific resources such as CSS under given conditions such as browser type, environment type screen orientation etc.
 
Also, **GSLink**, **GSCSSS**, **GSStyle** components, when loading CSS styles, use special logic to be able to share loaded styles with all other GS UI Components which use Shadow DOM. This enables us to use Bootstrap CSS across all Shadow DOM enabled components from a single place saving memory and increasing performance.
 
## Table of contents
 
1. [GSBase](./GSBase.md)
2. [GSCacheStyles](./GSCacheStyles.md)
3. [GSCSS](./GSCSS.md)
4. [GSLink](./GSLink.md)
5. [GSLinkExt](./GSLinkExt.md)
6. [GSScript](./GSScript.md)
7. [GSStyleExt](./GSStyleExt.md)
8. [GSTheme](./GSTheme.md)
   

