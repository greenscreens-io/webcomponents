# GSComponents Class

GSComponents is a static class cache registry for GS WebComponent instances. 

Every time a GS WebComponent UI element is injected into a page, its instance is cached inside GSComponent.

As some of GS WebComponents use shadow DOM, standard document.querySelector* function does not work across ShadowDom. Here, GSComponents are used for CSS selectors for finding rendered elements within all registered / cached Shadow DOM GS WebComponents.

For more info, please refer to **GSComponents** API doc.

NOTE: Please see [Install](../install.md) document for instructions on how to generate API manuals.


Examples and explanations for mostly used functions.

1. To get cached WebComponent by its ID

```
GSComponents.get('mytab');
```

2. To find cached WebComponent

```
GSComponents.find('GS-TAB');
```

3. To find HTML elements within cached WebComponents

```
GSComponents.query('.content');
```

4. To wait for WebCmoponent to activate

```
await GSComponents.wait('GS-MODAL');
```

<br>

&copy; Green Screens Ltd. 2016 - 2023
