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
  #inputCallback;

  #processing;  

  constructor(host) {
    const me = this;
    me.#processing = false;
    me.#host = host;
    me.#invalidCallback = me.#onInvalid.bind(me);
    me.#blurCallback = me.#onBlur.bind(me);
    me.#changeCallback = me.#onChange.bind(me);
    me.#focusCallback = me.#onFocus.bind(me);
    me.#inputCallback = me.#onInput.bind(me);
    host.addController?.(me);
  }

  hostConnected() {
    const me = this;
    me.#host.on('invalid', me.#invalidCallback);
    me.#host.on('blur', me.#blurCallback);
    me.#host.on('focus', me.#focusCallback);
    me.#host.on('change', me.#changeCallback);
    me.#host.on('input', me.#inputCallback);
  }

  hostDisconnected() {
    const me = this;
    delete me.#host.dataset.typed;
    me.#host.removeController?.(me);
    me.#host.off('invalid', me.#invalidCallback);
    me.#host.off('blur', me.#blurCallback);
    me.#host.off('focus', me.#focusCallback);
    me.#host.off('change', me.#changeCallback);
    me.#host.off('input', me.#inputCallback);
  }

  reset() {
    this.setCustomValidity('');
    this.#togglUI(this.isValid);
  }

  async report() {    
    const me = this;
    if (me.#processing) return;
    me.#processing = true;
    me.reportValidity();
    if (me.isVisible) {
      if (me.block) me.focus();
      if (me.beep && me.isTyped) await me.#beep();
    }
    await GSUtil.timeout(me.timeout);
    me.setCustomValidity(me.isValid ? '' : ' ');
    me.#togglUI(me.isValid);
    me.#processing = false;
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
  
  get isTyped() {
    return GSUtil.asBool(this.#host.dataset.typed);
  }

  get isValid() {
    return this.#host.validity.valid;
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

  get isVisible() {
    return GSDOM.isVisible(this.#host);
  }

  #onInput(e) {
    const me = this;
    if (!me.#host.dataset.typed) {
      me.#host.dataset.typed = true;
    }
    me.#processing = false;
  }

  #onFocus(e) {
    this.#togglUI(this.isValid);
  }

  #onInvalid(e) {
    this.report();
  }

  #onChange(e) {
    const me = this;
    if(me.checkValidity()) {
      me.reset();
    }
  }

  #onBlur(e) {
    const me = this;
    if (me.isValid) {
      me.reset();
    } else {
      me.checkValidity();
    }
  }

  #togglUI(isValid) {
    GSDOM.toggleClass(this.#host, 'is-invalid', !isValid);
  }

  #beep() {
    return GSBeep.beep(100, 1200, 150, 'triangle');
  }

}  