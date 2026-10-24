import GSEvents from "../base/GSEvents.mjs";

export default class OrientationController {

    static #controllers = new Set();
    static #frameRequested = false;

    #host;
    #handlePending = false;

    constructor(host) {
        const me = this;
        me.#host = host;
        me.#host.addController(me);
    }

    hostConnected() {
        OrientationController.#controllers.add(this);
        if (this.#handlePending) return;
        this.#handlePending = true;
        queueMicrotask(() => {
            this.#handlePending = false;
            if (OrientationController.#controllers.has(this)) this.handle();
        });
    }

    hostDisconnected() {
        OrientationController.#controllers.delete(this);
    }

    attributeCallback(name) {
        if (name === 'orientation') this.handle();
	}
    
    handle() {
		const me = this.#host;
        if (!me.offline) me.isValidOrientation ? me.show(true) : me.hide(true)
    }

    static #callback() {
        if (OrientationController.#frameRequested || OrientationController.#controllers.size === 0) return;
        OrientationController.#frameRequested = true;
        requestAnimationFrame(() => {
            OrientationController.#frameRequested = false;
            OrientationController.#controllers.forEach(c => c.handle());
        });
    }
 
    static {
        GSEvents.attach(window, screen.orientation, 'change', OrientationController.#callback);
    }
}