# GSBase Class
 
GSBase Class is mostly developed for conditional CSS resource activation, themming support and cached shared CSS across Shadow DOM based WebComponents.
 
GSBase Class is not registered as WebComponent itself. Injecting it into a page will not have any effect. It is used only as basis for other GS WebComponents inside **head** library.
 
<br>
 
### Attributes used
 
|Name            |Description                                                                  |
|----------------|-----------------------------------------------------------------------------|
| auto           | If automatic, the element is not self removed after the resource is loaded. |
| env            | Environment filter (assets,browser,mobile,desktop)                          |
| head           | Determine if loaded resource will be rendered inside html head              |
| schema         | Used to filter under which schema loader element is applied (hrrp,https)    |
| target         | Check browser target by value (windows, linux, apple)                       |
| url            | Retrieve resource url (src or href)                                         |
 

<br>

&copy; Green Screens Ltd. 2016 - 2023
