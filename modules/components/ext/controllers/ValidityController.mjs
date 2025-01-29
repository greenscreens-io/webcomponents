/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

import { GSBeep } from "../../../base/GSBeep.mjs";
import { GSDOM } from "../../../base/GSDOM.mjs";
import { GSUtil } from "../../../base/GSUtil.mjs";


/**
 * Handle for input/testarea to support validity checkups
 */
export class ValidityController {

  #host;

  #invalidCallback;
  #blurCallback;
  #changeCallback;
  #focusCallback;

  #processing;

  constructor(host) {
    const me = this;
    me.#processing = false;
    me.#host = host;
    me.#invalidCallback = me.#onInvalid.bind(me);
    me.#blurCallback = me.#onBlur.bind(me);
    me.#changeCallback = me.#onChange.bind(me);
    me.#focusCallback = me.#onFocus.bind(me);
    host.addController?.(me);
  }

  hostConnected() {
    const me = this;
    me.#host.on?.('invalid', me.#invalidCallback);
    me.#host.on?.('blur', me.#blurCallback);
    me.#host.on?.('focus', me.#focusCallback);
    me.#host.on?.('change', me.#changeCallback);
  }

  hostDisconnected() {
    const me = this;
    me.#host.removeController?.(me);
    me.#host.off?.('invalid', me.#invalidCallback);
    me.#host.off?.('blur', me.#blurCallback);
    me.#host.off?.('focus', me.#focusCallback);
    me.#host.off?.('change', me.#changeCallback);
  }

  setCustomValidity(val) {
    return this.#host.setCustomValidity(val);
  }

  checkValidity() {
    return this.#host.checkValidity();
  }

  reportValidity() {
    return this.#host.reportValidity();
  }

  focus() {
    return this.#host.focus();
  }

  get validity() {
    return this.#host.validity;
  }

  get value() {
    return this.#host.value;
  }

  get beep() {
    return this.#host.beep;
  }

  get block() {
    return this.#host.block;
  }

  get timeout() {
    return this.#host.timeout;
  }

  async #onInvalid(e) {
    const me = this;
    if (me.#processing) return;

    me.#processing = true;
    if (me.block) me.focus();
    if (me.beep) await me.#beep();
    if (me.timeout) {
      await GSUtil.timeout(me.timeout);
      me.setCustomValidity(me.validity.valid ? '' : ' ');
    }
    me.#processing = false;
  }

  #onChange(e) {
    const me = this;
    me.setCustomValidity('');
    const isValid = me.checkValidity();
    if (!isValid) me.reportValidity();
    return isValid;
  }

  #onFocus(e) {
    GSDOM.toggleClass(this.#host, 'is-invalid', !this.validity.valid);
  }

  #onBlur(e) {
    const me = this;
    me.#onFocus(e);
    const isValid = me.validity.valid;

    if (!isValid) {
      if (me.block) me.focus();
      if (me.beep) me.#beep();
    }
  }

  #beep() {
    return GSBeep.beep(100, 1200, 150, 'triangle');
  }

}  