/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

import { GSBeep } from "../../../base/GSBeep.mjs";
import { GSDOM } from "../../../base/GSDOM.mjs";
import { GSEvents } from "../../../base/GSEvents.mjs";
import { GSUtil } from "../../../base/GSUtil.mjs";


/**
 * Handle for input/textarea to support validity checkups
 */
export class ValidityController {

  #host = undefined;
  #processing = false;  

  constructor(host) {
    const me = this;
    me.#processing = false;
    me.#host = host;
    host.addController?.(me);
  }

  hostConnected() {
  }

  hostDisconnected() {
    const me = this;
    me.#host.removeController?.(me);
    me.#host = undefined;
    me.#processing = false;
  }

  get isAutoreport() {
    return this.#host.isAutoreport;
  }

  get isAutovalidate() {
    return this.#host.isAutovalidate;
  }

  get isValid() {
    return this.#host.validity.valid;
  }

  get disabled() {
    return this.#host.disabled;
  }

  get required() {
    return this.#host.required;
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

  get form() {
    return this.#host.form;
  }

  validate() {
    const me = this;    
    const sts = me.isValid || me.disabled;
    me.#togglUI(sts);
    return sts;
  }  
    
  onFocus(e) {
    this.validate();
  }

  onKeyDown(e) {
    const me = this;
    const isTab = e.key === 'Tab';
    const isEnter = e.key === 'Enter';
    if (isTab && !me.validate()) {
        me.#onBlock(e);
        me.#report();
    }

    if (isEnter) {
      const form = me.#host.form;
      if (form?.autosubmit) form.requestSubmit();
    }    
  }

  onInvalid(e) {
    const me = this;
    me.validate();
    // if (!e.composed) me.#host.emit('invalid', e, true, true);
  }

  onChange(e) {
    const me = this;
    me.#onAutoValidity(e);
    // if (!e.composed) me.#host.emit('change', e, true, true);
  }

  onBlur(e) {
    const me = this;
    me.#onBlock(e);
    me.#onAutoValidity(e);
    // if (!e.composed) me.#host.emit('blur', e, true, true);
  }

  #onBlock(e) {    
    const me = this;
    if (me.isValid) return;
    if (me.isVisible && me.block) {
      GSEvents.prevent(e, false, true, false);
      me.#focus();
    }        
  }

  #onAutoValidity(e) {
    return this.isAutoreport ? this.#reportValidity() : this.isAutovalidate ? this.#checkValidity() : this.validate();
  }  

  #focus() {
    return this.#host.focus();
  }

  #checkValidity() {
    const me = this;  
    me.validate();
    return me.#host.checkValidity();
  }

  #reportValidity() {
    const me = this;  
    me.validate();
    return me.#host.reportValidity();
  }  

  async #report() {    
    const me = this;
    if (me.#processing || me.isValid || !me.isVisible) return;
    me.#processing = true;
    if (me.beep) {
      try {
        await me.#beep();
        await GSUtil.timeout(me.timeout);
      } catch (e) {
        console.error(e);
      }
    }
    me.#processing = false;
  }

  #togglUI(isValid) {
    const me = this;
    requestAnimationFrame(() => {
      GSDOM.toggleClass(me.#host, 'is-invalid', !isValid);
    });
  }

  #beep() {
    return GSBeep.beep(100, 1200, 150, 'triangle');
  }

}  