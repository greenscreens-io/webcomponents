/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

/**
 * Handle screen orientation events.
 * Trigger rerender to optionally hide element if 
 * screen orientation is not supported
 */
export class OrientationController {

    static #hosts = new Set();
    #host;
    
    constructor(host) {
      this.#host = host;
      host.addController(this);
    }
    
    hostConnected() {
      OrientationController.#hosts.add(this);
      this.update();
    }
    
    hostDisconnected() {
      const me = this;
      OrientationController.#hosts.delete(me.#host);
      me.#host.removeController(me);      
      me.#host = null;
    }

    update() {
      this.#host.requestUpdate();
    }

    static #onOrientation(e) {
      Array.from(OrientationController.#hosts).forEach(h => h.update());
    }
    
    static {
      screen.orientation.addEventListener('change', OrientationController.#onOrientation);
    }
}  