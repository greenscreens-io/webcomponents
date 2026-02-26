/*
 * Copyright (C) 2015, 2026; Green Screens Ltd.
 */

import { GSUtil } from "../../../base/GSUtil.mjs";

/**
 * Handle for input type number to support max length entry
 */
export class NumberController {

  #host;

  constructor(host) {
    const me = this;
    me.#host = host;
    host.addController(me);
  }

  hostConnected() {
    const me = this;
  }

  hostDisconnected() {
    const me = this;
    me.#host.removeController(me);
  }

  get maxLength() {
    return GSUtil.asNum(this.#host.maxLength, 0);
  }

  get value() {
    return this.#host.value;
  }

  set value(val) {
    this.#host.value = val;
  }

  get type() {
    return this.#host?.type;
  }
    
  onInput(e) {
    const me = this;
    if (me.type === 'number') {
      if (me.maxLength > 0 && me.value.length > me.maxLength) {
          me.value = me.value.substring(0, me.maxLength);
      }
    }
  }

}  