/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */

import { GSEventBus } from "../base/GSEventBus.mjs";

/**
 * Controller for multiple elements groups
 */
export class GroupController {

  #host;

  #busEvent;
  #busCallback;

  constructor(host) {
    const me = this;
    me.#host = host;
    host.addController(me);
  }

  hostConnected() {
    const me = this;
    if (me.#host.group) {
      me.#busCallback = me.#onBusEvent.bind(me);
      me.#busEvent = GSEventBus.register(me.#host.clazzName);
      me.#busEvent.on(me.#host.group, me.#busCallback);
    }
  }

  hostDisconnected() {
    const me = this;
    me.#busEvent?.off(me.#host.group, me.#busCallback);
    me.#host.removeController(me);
    me.#host = null;
  }

  #onBusEvent(e) {
    this.#host.onBusEvent?.(e);
  }

  notify(data) {
    const me = this;
    me.#busEvent.emit(me.#host.group, {owner: me.#host, item:data}); 	
  }

}  