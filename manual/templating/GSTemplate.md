# GSTemplate WebComponent
 
Templates can be loaded and injected in multiple ways.
 
1. [Use template ID reference](#idref)
2. [Use web url](#weburl)
3. [Use function](#func)
4. [Conditional activation](#conditional)
5. [Shadow DOM Mode](#shadow)
6. [Targeted injection](#slot)
 
<br>
 
## <a name="idref"></a> Use template ID reference
---
For a small piece of shared HTML code that will be injected on multiple locations, it is enough to use standaard  ```<template>``` HTML element as resource.
 
Later in the code, create as many as needed ```<gs-template>``` injectable elements that load referenced code.
 
```
<head>
 <template id="tplLogin">
    ... html code ...
 </template>
</head>
<body>
    <gs-template href="#tplLogin"></gs-template>
</body>    
```
 
## <a name="weburl"></a> Use web URL
---
 
Templates can be loaded from standard URL locations. Partial and full URL formats are supported.
 
```
<gs-template href="mytemplate.html"></gs-template>
<gs-template href="./mytemplate.html"></gs-template>
<gs-template href="https:/localhost/mytemplate.html"></gs-template>
```
 
Use http: or https:, based on current page url address
```
<gs-template href="//mytemplate.html"></gs-template>
```
 
## <a name="func"></a> Use function to load
---
 
The template loader can call a custom function to load a template source.
 
```
function myTemplateFn() {
    return ... template source;
}
<gs-template href="myTemplateFn"></gs-template>
```
 
## <a name="conditional"></a> Conditional activation
---
Template loading can be activated by conditional attributes by defining OS, environment, browser type or screen orientation.
 
1. **os** attribute is extracted from browser navigator element, can be any provisional name such as "windows", "linux" etc.
2. **orientation** attribute is determined by orientation change event, values accepted are "", "vertical", "horizontal"
3. **environment** attribute can be "", "desktop", "tablet", "mobile"
 
Combining those values, one can determine for example to load different templates in 2 orientation X 3 environment X 3 os with at least 48 conditional combinations.
 
```
<gs-template href="//mytemplate.html" os="window" orientation="vertical" environment="desktop"></gs-template>
```
 
## <a name="shadow"></a> Shadow DOM
---
 
Template content can be loaded as independent from the rest of parent elements (in Shadow DOM) or  as a part of parent HTML code.
 
By default, template source is injected into a self as Shadow DOM. Use attribute **flat** to change behavior.
 
```
<gs-template href="//mytemplate.html" flat="true"></gs-template>
```
 
## <a name="slot"></a> Targeted injection
---
 
Template content can be injected in slot elements when **flat** mode is used.
 
```
<div>
  .. some complex html...
  <slot name="test"></slot>
</div>
<gs-template href="//mytemplate.html" flat="true" slot="test"></gs-template>
```
 