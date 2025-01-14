# GSController WebComponent
 
GSController WebComponent is a helper allowing easier integration of component templates and custom code.
Alternatively, extend already existing classes with custom ones and register them as custom HTML tags.
  
<br>
 
## Attributes
---
 
| Name               | Description                                              |
|--------------------|----------------------------------------------------------|
| controller         | Class name to instantiate                                |
| module             | JaavScript module containing controller class            |

<br>
 
## Example
---

**NOTE :**
For more details, check [Controller Demo](../../demos/helpers/controller.html)

Will load JavaScript module which exports a class named CustomButtonController
```HTML
<gs-button title="Click Me" color="primary" text="light">
    <gs-controller module="./CustomButtonController.mjs" controller="CustomButtonController"></gs-controller>
</gs-button>
```

Example of multiple controllers. Simply extend existing components with external code.
Module will be loaded only once. Other modules will be reused from cache.

```HTML
<gs-button title="Click Me" color="primary" text="light">
    <gs-controller module="./CustomButtonController.mjs" controller="CustomButtonController"></gs-controller>
    <gs-controller module="./CustomButtonController.mjs" controller="CustomMouseController"></gs-controller>
    <gs-controller module="./CustomButtonController.mjs" controller="LoginController"></gs-controller>
</gs-button>
```


If a class named CustomButtonController as already laoded and attached to the global scope, "module" atribute is not required.

```HTML
<script type="module">
     import { CustomButtonController } from "./CustomButtonController.mjs";
     // ... do some logic ...
     globalThis.CustomButtonController = CustomButtonController;
</script>
<gs-button title="Click Me" color="primary" text="light">
    <gs-controller controller="CustomButtonController"></gs-controller>
</gs-button>
```

<br>

&copy; Green Screens Ltd. 2016 - 2025
