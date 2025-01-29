/*
 * Copyright (C) 2015, 2025; Green Screens Ltd.
 */

/**
 * Handle multiple patterns
 */
export class MultipatternController {

  #host;

  #changeCallback;

  constructor(host) {
    const me = this;
    me.#host = host;
    me.#changeCallback = me.#onChange.bind(me);
    host.addController(me);
  }

  hostConnected() {
    const me = this;
    me.#host.on('change', me.#changeCallback);
  }

  hostDisconnected() {
    const me = this;
    me.#host.removeController(me);
    me.#host.off('change', me.#changeCallback);
  }
  
  validate() {
    const me = this;
    me.setCustomValidity('');

    const isValid = me.#host.checkValidity();
    const isMatch = isValid && me.isMatch;

    if (!isMatch) me.setCustomValidity('Data did not match pattern!');
    if (!isValid) me.reportValidity();
    return isValid;
  }

  checkValidity(isValid) {    
    return isValid && this.isMatch;  
  }

  setCustomValidity(val) {
    return this.#host.setCustomValidity(val);
  }

  reportValidity() {
    return this.#host.reportValidity();
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

  #onChange(e) {
    const me = this;
    me.validate();
  }

}  