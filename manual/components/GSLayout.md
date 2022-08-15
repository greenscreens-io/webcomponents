# GSLayout WebComponent
 
GSLayout WebComponent renders vertically or horizontally aligned elements by using Bootstrap **d-flex** class.
 
Layouts can be nested to create complex UI for dashboards and SPA apps.
 
Layout elements are defined with generic ```<gs-item>``` tag.
 
<br>
 
## Attributes ```<gs-layout>```
---
 
| Name               | Description                                              |
|--------------------|----------------------------------------------------------|
| css                | CSS classes for alert content                            |
| type               | Orientation type (vertical, horizontal)                  |
 
<br>
 
## Attributes ```<gs-item>```
---
 
| Name               | Description                                              |
|--------------------|----------------------------------------------------------|
| css                | CSS classes for layout item                              |
| resizable          | Is layout item resizable or fixed width / height (bool)  |
| max                | Layout item max height/width                             |
| min                | Layout item min height/width                             |
| h-pos              | Layout item child elements horizontal positioning        |
| v-pos              | Layout item child elements vertical positioning          |
| template           | Load layout item content from external resource          |
 
**NOTE:**
Values for **h-pos** and **v-pos** are: **start**, **end**, **top**, **bottom**, **center**.
 
<br>
 
## Example
---
 
Example shows nested layouts to create dashboards or SPA App layouts.
 
```html
<!-- header main footer -->
<gs-layout type="vertical" css="">
    <!-- header - tries to load template, if not found, show text-->
    <gs-item css="text-bg-light" resizable="true" id="hdr1" template="head" v-pos="center" h-pos="center" min="5">header</gs-item>
    <!-- main - central panel containing another elements as tempalte or child components  -->
    <gs-item css="text-bg-info">
 
        <!-- left-sidebar main right-sidebar -->
        <gs-layout type="horizontal">
            <!-- left sidebar panel -->
            <gs-item css="text-bg-secondary" id="sb1" resizable="true" min="60" max="280" template="">left-sidebar</gs-item>
            <!-- central panel -->
            <gs-item css="text-bg-primary" id="content" v-pos="top" h-pos="center">centerd data</gs-item>
            <!-- right sidebar panel -->
            <gs-item css="text-bg-secondary" id="sb2" resizable="true" min="60" max="280" template="" v-pos="top" h-pos="end">right-sidebar</gs-item>
        </gs-layout>
       
    </gs-item>
    <!-- footer - tries to load template, if not found, show text-->
    <gs-item css="text-bg-dark" resizable="true" id="ftr1" template="foot" v-pos="center" h-pos="center" min="5">footer</gs-item>
</gs-layout>
```
 