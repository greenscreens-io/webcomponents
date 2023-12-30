import GSEvents from "../base/GSEvents.mjs";

export default class OrientationController {

    static #controllers = new Set();

    #host;

    constructor(host) {
        const me = this;
        me.#host = host;
        me.#host.addController(me);
    }

    hostConnected() {
        OrientationController.#controllers.add(this);
    }

    hostDisconnected() {
        OrientationController.#controllers.delete(this);
    }

    attributeCallback(name, oldValue, newValue) {
        if (name === 'orientation') this.handle();
	}
    
    handle() {
		const me = this.#host;
        if (!me.offline) me.isValidOrientation ? me.show(true) : me.hide(true)
    }

    static #callback(e) {
        requestAnimationFrame(() => {
            OrientationController.#controllers.forEach(c => c.handle());
        });
    }
 
    static {
        GSEvents.attach(window, screen.orientation, 'change', OrientationController.#callback);
    }
}