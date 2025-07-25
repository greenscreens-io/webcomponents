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

  get raw() {
    return this.#host.raw;
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
    const input = e.target;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    input.value = this.#transform();
    input.setSelectionRange(start, end);
  }

  onChange(e) {
    this.value = this.#transform();
  }

  onBlur(e) {
    this.value = this.#transform();
  }

  #transform() {
    const me = this;
    if (me.type === 'text') {
      const map = GSCSSMap.styleValue(this.#host, 'text-transform');
      if (map) return GSUtil.textTransform(map.value, me.raw);
    }
    return me.value;
  }

}  