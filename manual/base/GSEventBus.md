# GSEventBus Class

GSEventBus Class is an generic shared event dispatcher. Can be used to cerate direct communication between web components.

Usage 

```JavaScript
const myEventBus = new EventBus();

myEventBus.on('event-name', ({ detail }) => {
  console.log(detail);
});

myEventBus.once('event-name', ({ detail }) => {
  console.log(detail);
});

myEventBus.emit('event-name', 'Hello'); 
myEventBus.emit('event-name', 'World'); 	
```