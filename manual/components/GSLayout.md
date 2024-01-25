# GSLayout WebComponent
 
GSLayout WebComponent renders vertically or horizontally aligned elements by using Bootstrap **d-flex** class.
 
Layouts can be nested to create complex UI for dashboards and SPA apps.
 
Layout elements are defined with generic ```<gs-item>``` tag.
 
<br>
 
## Attributes ```<gs-layout>```
---
 
| Name               | Description                                              |
|--------------------|----------------------------------------------------------|
| type               | Orientation type (vertical, horizontal)                  |
 
<br>
 
## Attributes ```<gs-item>```
---
 
| Name               | Description                                              |
|--------------------|----------------------------------------------------------|
| resizable          | Is layout item resizable or fixed width / height (bool)  |
| max                | Layout item max height/width                             |
| min                | Layout item min height/width                             |
| h-pos              | Layout item child elements horizontal positioning        |
| v-pos              | Layout item child elements vertical positioning          |
| type               | Orientation type (vertical, horizontal)                  |
 
**NOTE:**
Values for **h-pos** and **v-pos** are: **start**, **end**, **top**, **bottom**, **center**.
 
<br>
 
## Example
---
 
Example shows nested layouts to create dashboards or SPA App layouts.
 
**NOTE :**
For more details, check [Layouts Demo](../../demos/layouts/)
 
```html
<!-- header main footer -->
<gs-layout type="vertical" css="">
    <!-- header - tries to load template, if not found, show text-->
    <gs-item css="text-bg-light" resizable id="hdr1" template="head" v-pos="center" h-pos="center" min="5">header</gs-item>
    <!-- main - central panel containing another elements as template or child components  -->
    <gs-item css="text-bg-info" type="horizontal">
 
        <!-- left sidebar panel -->
        <gs-item css="text-bg-secondary" id="sb1" resizable min="60" max="280">left-sidebar</gs-item>
        <!-- central panel -->
        <gs-item css="text-bg-primary" id="content" v-pos="top" h-pos="center">centered data</gs-item>
        <!-- right sidebar panel -->
        <gs-item css="text-bg-secondary" id="sb2" resizable min="60" max="280" v-pos="top" h-pos="end">right-sidebar</gs-item>
       
    </gs-item>
    <!-- footer - tries to load template, if not found, show text-->
    <gs-item css="text-bg-dark" resizable id="ftr1" template="foot" v-pos="center" h-pos="center" min="5">footer</gs-item>
</gs-layout>
```

<br>

&copy; Green Screens Ltd. 2016 - 2024
