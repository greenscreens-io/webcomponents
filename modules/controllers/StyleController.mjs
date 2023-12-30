import GSEvents from "../base/GSEvents.mjs";

export default class StyleController {

    static #controllers = new Set();

    #host;

    constructor(host) {
        const me = this;
        me.#host = host;
        me.#host.addController(me);
    }

    hostConnected() {
        StyleController.#controllers.add(this);
    }

    hostDisconnected() {
        StyleController.#controllers.delete(this);
    }

    attributeCallback(name, oldValue, newValue) {
        if (name === 'orientation') this.handle();
	}
    
    handle() {
		this.#host?.updateUI();
    }

    static #callback(e) {
        requestAnimationFrame(() => {
            StyleController.#controllers.forEach(c => c.handle());
        });
    }
 
    static {
        GSEvents.attach(window, document, 'gs-style', StyleController.#callback);
    }
}