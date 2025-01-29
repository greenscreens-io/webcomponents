/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

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
  
  checkValidity() {    
    const me = this;  
    let isMatch = true;
    if (me.isValid) {
      isMatch = me.isEmpty || me.isMatch;
      if (!isMatch) me.setCustomValidity('Pattern not matched!');
    }
    return me.isValid && isMatch;
  }

  setCustomValidity(val) {
    return this.#host.setCustomValidity(val);
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

  get patterns() {
    const obj = this.#host.multipattern;
    if (obj instanceof RegExp) return [obj];
    if (Array.isArray(obj)) return obj.filter(o => o instanceof RegExp);
    throw new Error('Invalid multipattern value. Expected RegExp object or array.');
  }

  get dataset() {
    return this.#host.dataset;
  }

  get isMatch() {
    const me = this;
    let isMatch = true;
    for (const r of me.patterns) {
      isMatch = r.test(me?.value);
      if (isMatch) break;
    }
   
    return isMatch;
  }

}  