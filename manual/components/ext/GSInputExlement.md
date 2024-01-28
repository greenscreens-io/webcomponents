# GSInputExlement WebComponent 

GSInputExlement WebComponent is an extension of browser standard HTMLInputElement which adds custom field processing.

Main support added is masked input through **mask** attribute, validation, datalist integration.

Different controllers will activate bsed on field properties.


## Example
---

For more examples, please refer to [Input field demos](../../../../demos/inputmask.html)

```html
 <input is="gs-ext-input" mask="YYYY-MM-DDD">

<input is="gs-ext-input" type="password" reveal>

<input is="gs-ext-input" type="number" maxlength="5">

 <input is="gs-ext-input" list="mylist">
 <datalist id="mylist">
     ....
 </datalist>
 ```
<br>

&copy; Green Screens Ltd. 2016 - 2024
