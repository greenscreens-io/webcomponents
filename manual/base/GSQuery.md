# GSQuery Class
 
GSQuery Class is a Proxy class for wrapping HTMLElement, allowing to use GS query across shadow dom and for easier style property get /set operations.

<br>

## Usage

```JavaScript
const el = GSQuery.wrap(document.body);

el.query('div') // query across shadow dom

el.css = {width:'100px'} // easier way to set css
 
// chained css property setup
el.css.width('100px').background('red');
 
// retrieve calculated value
console.log(el.css.background);
console.log(el.css.asNum('width'));

```

<br>

&copy; Green Screens Ltd. 2016 - 2024
