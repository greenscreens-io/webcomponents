# GSPromise class
 
GSPromise class is a generic implementaion extending browser native Promise class adding timeout support. 
GSPromise is mostly used for asynchronous event monitoring with simeout and abort support.

For more info, please refer to **Promise** API doc.
 
NOTE: Please see [Install](../install.md) document for instructions on how to generate API manuals.
 
<br>
 
## Attributes
---
 
| Name               | Description                                                   |
|--------------------|---------------------------------------------------------------|
| callback           | Promise callback                                              |
| signal             | timeout (number), AbortSignal, AbortController                |
 
<br>

## Usage 

```JavaScript
// standard Abortontroller does not support timeout
const callback = (resolve,reject) => {
    console.log('async call hapened');
    resolve();
};

const promise = GSPromise(callback, 1000);
// block until aborted
await promise.await();

const promise = GSPromise(callback, AbortSignal.timeout(1000));
// block until aborted
await promise.await();

const controller = new GSAbortController(1000);
const promise = GSPromise(callback, controller.signal);
controller.abort();
// block until aborted - return immediately as it is aborted already 
await promise.await();
```
<br>

&copy; Green Screens Ltd. 2016 - 2025
