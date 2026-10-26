# GSServiceWorker WebComponent
 
GSServiceWorker WebComponent is a helper component to inject service worker script.
ServiceWorker is generally used as a fetch API overried, commonly used to build a resource cache engine.

NOTE: For service worker to intercept the fetch, it must be served from the root of the domain or use custom scope,
Cutom scope to work, web server must respond with "Service-Worker-Allowed : /" header for the service worker file.
          
<br>
 
## Attributes
---
 
| Name               | Description                                              |
|--------------------|----------------------------------------------------------|
| module             | Pixel size                                               |
| trace              | Boolean, if set will enable request console logging      |
| scope              | Script operational scope - url root                      |
| src                | Url to the service worker script                         |
| disabled           | Disable the component and unregister its service worker  |

<br>
 
## Example
---

```HTML
<gs-service-worker src="/sw.mjs" trace module></gs-service-worker>

<gs-service-worker src="./modules/sw.mjs" scope="/"  trace module></gs-service-worker>
```

Disconnecting the element only releases its message channel and listeners; use
`disabled` to unregister the service worker. The component emits a `loaded`
event with a boolean detail after registration succeeds or fails.
 
<br>

&copy; Green Screens Ltd. 2016 - 2025
