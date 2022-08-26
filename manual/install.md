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

However, we preapred Webpack configuration if tehre is a requirement to build a single library. Check inside [webpack.config.js](../webpack.config.js) for instructions.
 
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
 
<br>
 
### <a name="web"></a> **Use WebComponents in browsers**
---
 
Copy **modules** directory to a web server along with Bootstrap 5.2.0.+ CSS and as shown in example below, include resources in ```<head>``` section of a web page before using GS WebComponents.
 
```html
<html>
    <head>
        <!-- If using templates, set template root path -->
        <script type="text/javascript">
            self.GS_TEMPLATE_URL = '/assets/templates';
        </script>
       
        <!-- load library core - head,base,template libraries -->
        <script type="module" src="/modules/index.mjs"></script>
       
        <!-- load all UI components -->
        <script type="module" src="/modules/components/index.mjs"></script>
   
        <!-- load mandatory Bootstrap CSS -->
        <gs-css global="true" url="/assets/css/custom_5.2.0.css" rel="stylesheet"></gs-css>  
        
        <!-- and optionally Bootstrap Icons -->
        <gs-css global="true" url="/assets/icons/bootstrap-icons.css" rel="stylesheet" notheme="true"></gs-css>        
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
            self.GS_TEMPLATE_URL = '/assets/templates';
        </script>
       
        <!-- load library core - head,base,template libraries -->
        <script type="module" src="/release/io.greenscreens.components.all.js"></script>
          
        <!-- load mandatory Bootstrap CSS and optionally Bootstrap Icons -->
        <gs-css global="true" url="/assets/css/custom_5.2.0.css" rel="stylesheet"></gs-css>  

        <!-- and optionally Bootstrap Icons -->
        <gs-css global="true" url="/assets/icons/bootstrap-icons.css" rel="stylesheet" notheme="true"></gs-css>        
    </head>
    <body>
    </body>
</html>
```