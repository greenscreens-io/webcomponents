
# Green Screens DataController

Controller responsible to link WebComponent to gs-data-handler readind/writing events.

<br>

## Usage 

Example linking DataController to the custom WebComponent

```JavaScript
export class MyComponent extends GSElement {

  static properties = {
    storage: {},
    data: { type: Array },
  }

  #dataController;

  constructor() {
    super();
    this.data = [];
    this.#dataController = new DataController(this);
  }

  renderUI() {
    const me = this;
    return html`<div>${me.data.map(o => html´<span>o.name</span>´)}</div>`;
  }

  onDataRead(data) {
    this.values = data;
  }

  onDataWrite(data) {

  }

  onDataError(e) {
    GSLog.error(this, e);
  }

  static {
    this.define('my-component');
  }

}
```

```HTML
<gs-data-handler id="datacontext"></gs-data-handler>
<my-component storage="datacontext"></my-component>
```

<br>

&copy; Green Screens Ltd. 2016 - 2024
