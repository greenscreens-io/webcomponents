# Install instructions
 
## Table of contents
 
1. [Clone Git Repo](#clone)
2. [Build source code](#build-source)
3. [Build API boc from source](#build-doc)
3. [Use Demos](#demos)
3. [Use WebComponents in browsers](#web)
 
<br><br>
 
### <a name="clone"></a> Clone Git repo
---
 
Open project at [GitHub Repo](https://github.com/greenscreens-io/webcomponents) and follow instructions on how to clone repo or use the following from the command line.
 
```
https://github.com/greenscreens-io/webcomponents.git
```
 
<br>
 
### <a name="build-source"></a> **Build source**
---
 
GS WebComponents are written in ES2022 JavaScript as modules. Generally, building the source into a single JavaScript file is not required.  
 
As source requires modern browsers, and as modern browsers use HTTPS/2 which, when a web server is configured properly, pushes resources through a single channel, requirements to build modules is not so important anymore.

Another advantage of not "building" JavaScript Modules is [tree-shaking](https://en.wikipedia.org/wiki/Tree_shaking) support which allows loading only required modules on demand.

However, we preapred Rollup configuration if there is a requirement to build a single library. Check inside [rollup.config.mjs](../rollup.config.mjs) for instructions.
 
<br>
 
### <a name="build-doc"></a> **Build API doc**
---
 
Even though there is a comprehensive manual for every UI component, one can generate API documentation from source code by using JSDoc.
 
1. Install [NodeJS](https://nodejs.org/en/download/)
2. Install [JSDoc](https://www.npmjs.com/package/jsdoc)
 
    ```npm install -g jsdoc```
 
3. Generate API Doc (document will be generated inside **./doc** directory)
 
    ```npm run doc```
 
<br>
 
### <a name="demos"></a> **Use Demos**
---
 
To use provided GS WebComponents demos, simply copy the whole project to a web server root path and point to a **./webcomponents/demos** folder. There is no need for any other dependencies or building process.

Also, live example are avaialble at Github pages at [https://greenscreens-io.github.io/webcomponents/demos/index.html](https://greenscreens-io.github.io/webcomponents/demos/index.html) or from project web page at [https://webcomponents.greenscreens.ltd](https://webcomponents.greenscreens.ltd)
 
<br>
 
### <a name="web"></a> **Use WebComponents in browsers**
---
 
Copy **modules** directory to a web server along with Bootstrap 5.2.0.+ CSS and as shown in example below, include resources in ```<head>``` section of a web page before using GS WebComponents.
 
```html
<html>
    <head>
        <!-- If using templates from alternative location, set template root path -->
        <script type="text/javascript">
            self.GS_TEMPLATE_URL = '/webcomponents/assets/templates';
        </script>
       
        <!-- load library core - head,base,template libraries -->
        <script type="module" src="/webcomponents/modules/index.mjs"></script>
       
        <!-- load all UI components -->
        <script type="module" src="/webcomponents/modules/components/index.mjs"></script>
   
        <!-- load mandatory Bootstrap CSS -->
        <gs-css global="true" src="/webcomponents/assets/css/io.greenscreens.bootstrap_5.2.0.css" rel="stylesheet"></gs-css>  
        
        <!-- and optionally Bootstrap Icons -->
        <gs-css global="true" src="/webcomponents/assets/icons/bootstrap-icons.css" rel="stylesheet" notheme="true"></gs-css>        
    </head>
    <body>
    </body>
</html>
```

When using library built with WebPack, use the following template.
 
```html
<html>
    <head>
        <!-- If using templates, set template root path -->
        <script type="text/javascript">
            self.GS_TEMPLATE_URL = '/webcomponents/assets/templates';
        </script>
       
        <!-- load library core - head,base,template libraries -->
        <script type="module" src="/webcomponents/release/io.greenscreens.components.all.js"></script>
          
        <!-- load mandatory Bootstrap CSS-->
        <gs-css global="true" url="/webcomponents/release/io.greenscreens.bootstrap_5.2.0.min.css" rel="stylesheet"></gs-css>  

        <!-- and optionally Bootstrap Icons -->
        <gs-css global="true" src="/webcomponents/assets/icons/bootstrap-icons.css" rel="stylesheet" notheme="true"></gs-css>        
    </head>
    <body>
    </body>
</html>
```

<br>

&copy; Green Screens Ltd. 2016 - 2023
