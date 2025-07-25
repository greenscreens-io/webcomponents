/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

import { GSUtil } from "../../../base/GSUtil.mjs";

/**
 * Handle multiple patterns
 */
export class MultipatternController {

  #host;

  constructor(host) {
    const me = this;
    me.#host = host;
    host.addController(me);
  }

  hostConnected() {
  }

  hostDisconnected() {
    const me = this;
    me.#host.removeController(me);
  }
  
  validate() {    
    const me = this;  
    const isMatch = me.isEmpty ? true :me.isMatch;
    me.setCustomValidity(isMatch ? '' : 'Pattern not matched!');
    return isMatch;
  }

  setCustomValidity(val) {
    return this.#host.setCustomValidity(val);
  }

  get isEmpty() {
    return GSUtil.isStringEmpty(this.raw);
  }
    
  get isValid() {
    return this.#host.validity.valid;
  }

  get value() {
    return this.#host.value;
  }

  set value(val) {
    this.#host.value = val;
  }

  get raw() {
    return this.#host.raw;
  }

  get required() {
    return this.#host.required;
  }

  get disabled() {
    return this.#host.disabled;
  }    

  get dataset() {
    return this.#host.dataset;
  }

  get patterns() {
    const obj = this.#host.multipattern;
    if (obj instanceof RegExp) return [obj];
    if (Array.isArray(obj)) return obj.filter(o => o instanceof RegExp);
    throw new Error('Invalid multipattern value. Expected RegExp object or array.');
  }

  get isMatch() {
    const me = this;
    let isMatch = true;
    for (const r of me.patterns) {
      isMatch = r.test(me.value);
      if (isMatch) break;
    }
   
    return isMatch;
  }

  onKeyDown(e) {
    const isTab = e.key === 'Tab';
    if (isTab) {
      this.validate();
    } 
  }

  onBlur(e) {
    this.validate();
  }

  onChange(e) {
    this.validate();
  }

}  