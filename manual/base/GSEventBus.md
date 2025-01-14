# GSEventBus Class

GSEventBus Class is an generic shared event dispatcher. Can be used to create direct communication between web components.

Usage 

```JavaScript
GSEventBus.send('login', 'event-name', {data: ''});

const myEventBus = GSEventBus.register('login');

myEventBus.on('event-name', ({ detail }) => {
  console.log(detail);
});

myEventBus.once('event-name', ({ detail }) => {
  console.log(detail);
});

myEventBus.emit('event-name', 'Hello'); 
myEventBus.emit('event-name', 'World'); 	
```

<br>

&copy; Green Screens Ltd. 2016 - 2025
