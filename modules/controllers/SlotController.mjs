/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

/**
 * Handle event when template slot changes
 */
export class SlotController {

    #host;
    
    constructor(host) {
      this.#host = host;
      host.addController(this);
    }
    
    hostConnected() {
      const me = this;
      const target = me.#host.renderRoot || me.#host;
      me.#host.attachEvent(target, 'slotchange', me.#onSlotChanged.bind(me));
    }
    
    hostDisconnected() {
      const me = this;
      me.#host.removeController(me);      
      me.#host = null;
    }

    #onSlotChanged(e) {
      e.target.assignedElements().forEach(el => {
        el.onSlotInjected?.(e.target);
      });
    }

}  