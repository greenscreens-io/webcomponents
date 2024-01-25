# GSLocalization Class
 
GSLocalization Class is a generic class for loading and caching JSON based localization translations in optimized way preventing multiple language rsource loading when requested by WebComponent async activation.

When language resource is loaded, gs-language event is fired at the window level to notify WebComponents language is redy for text translation.

### Mapping translations

Use base definition "default.json" in format shown below. 
First key is default initial text, second key is unique translation ID. 

```JavaScript
// default.json
{
    "Hello world" : "HELLO_WORLD"
}
```

To translate for specific language, name file by language ISO acronyme and use reverse mapping to default.json file.

```JavaScript
// hr.json
{
    "HELLO_WORLD" : "Pozdrav svijete"
}
```

### Default resource location

Default resource location is **'/i18n/'**. To change default location where JSON translation files are loaded from, change global variable as shown below.

```JavaScript
globalThis.GS_LOCALIZATION_URL = 'YOUR_URL_FOR_JSON_TRANSLATION';
```

### Default language

Engie nwill use default language set by page or by browser. To override default language, set global variable as shown below.

```JavaScript
globalThis.GS_LOCALIZATION_LANGUAGE = 'hr';
```

**NOTE:** Global variables must be set before scripts are loaded int a page. 

```html
<!-- Page default language, will override browser langauge -->
<html lang="en">
    <head>
        <!-- Override  -->
        <script>
            globalThis.GS_LOCALIZATION_URL = '/assets/localization/';
            globalThis.GS_LOCALIZATION_LANGUAGE = 'hr';
        </script>
        ...
        ...
        <!-- Other JavaScript and CSS resources -->
    </head>
    <body>
         ...
    </body>
</html>
```

<br>

&copy; Green Screens Ltd. 2016 - 2024
