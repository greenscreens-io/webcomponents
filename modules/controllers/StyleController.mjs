import GSEvents from "../base/GSEvents.mjs";

export default class StyleController {

    static #controllers = new Set();
    static #frameRequested = false;

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

    handle() {
		this.#host?.updateUI();
    }

    static #callback() {
        if (StyleController.#frameRequested || StyleController.#controllers.size === 0) return;
        StyleController.#frameRequested = true;
        requestAnimationFrame(() => {
            StyleController.#frameRequested = false;
            StyleController.#controllers.forEach(c => c.handle());
        });
    }
 
    static {
        GSEvents.attach(window, document, 'gs-style', StyleController.#callback);
    }
}