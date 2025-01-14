/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

import { GSCSSMap } from "../../../base/GSCSSMap.mjs";
import { GSUtil } from "../../../base/GSUtil.mjs";

/**
 * Handle for input type text to support text value changes based on CSS
 */
export class TextController {

  #host;

  #inputCallback;

  constructor(host) {
    const me = this;
    me.#host = host;
    me.#inputCallback = me.#onInput.bind(me);
    host.addController(me);
  }

  hostConnected() {
    const me = this;
    me.#host.on('input', me.#inputCallback);
  }

  hostDisconnected() {
    const me = this;
    me.#host.removeController(me);
    me.#host.off('input', me.#inputCallback);
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

  #onInput(e) {
    const me = this;
    if (me.type === 'text') me.value = me.#updateText(me.value);
  }

  #updateText(value = '') {
    const map = GSCSSMap.styleValue(this.#host, 'text-transform');
    if (map) value = GSUtil.textTransform(map.value, value);
    return value;
  }

}  