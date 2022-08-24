class Test extends HTMLElement {

    static {
        customElements.define('my-test', Test);
    }

    constructor() {
        super();
        console.log('created')
        console.log(this.parentElement)
        console.log(this.firstElementChild)
    }

    connectedCallback() {
        console.log('connected')
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.innerHTML = '<template><slot></slot></template>';
    }
}