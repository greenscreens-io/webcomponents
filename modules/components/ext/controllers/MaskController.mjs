/*
 * Copyright (C) 2015, 2025 Green Screens Ltd.
 */

/**
 * Handle field mask 
 */
export class MaskController {

  static #special = '.^$*+?()[]{}\|';

  static #maskType = {
    x: /[0-9a-fA-F]/g,
    n: /[0-9]/g,
    y: /[0-9]/g,
    m: /[0-9]/g,
    d: /[0-9]/g,
    h: /[0-9]/g,
    s: /[0-9]/g,
    '.': /[0-9]/g,
    '#': /[a-zA-Z]/g,
    '*': /[0-9a-zA-Z]/g,
    '_': /./g
  };

  #back = false;
  #slots;
  #prev;
  #first;
  #accept;
  #pattern;

  #host;

  #keyDownCallback;
  #inputCallback;
  #focusCallback;
  #blurCallback;

  constructor(host) {
    const me = this;
    me.#host = host;
    me.#keyDownCallback = me.#onKeyDown.bind(me);
    me.#inputCallback = me.#format.bind(me);
    me.#focusCallback = me.#onFocus.bind(me);
    me.#blurCallback = me.#onBlur.bind(me);
    host.addController(me);
  }

  hostConnected() {
    const me = this;
    me.initRules();
    me.#host.on('keydown', me.#keyDownCallback);
    me.#host.on('input', me.#inputCallback);
    me.#host.on('focus', me.#focusCallback);
    me.#host.on('blur', me.#blurCallback);
  }

  hostDisconnected() {
    const me = this;
    me.#host.removeController(me);
    me.#host.off('keydown', me.#keyDownCallback);
    me.#host.off('input', me.#inputCallback);
    me.#host.off('focus', me.#focusCallback);
    me.#host.off('blur', me.#blurCallback);
  }

  initRules() {
    const me = this;
    if (!me.pattern) return;
    me.#slots = me.#builSlots();
    me.#prev = (j => Array.from(me.pattern, (c, i) => me.#slots.has(c) ? j = i + 1 : j))(0);
    me.#first = [...me.pattern].findIndex(c => me.#slots.has(c));
    me.#accept = me.#builAccept();
    me.#toPattern();    
  }
  
  validate() {
    const me = this;
    me.setCustomValidity('');
    me.#pattern.lastIndex = 0;
    const isMatch = me.required ? me.#pattern.test(me.raw) : true;
    const isValid = isMatch && me.checkValidity();
    if (!isMatch) me.setCustomValidity('Data did not match pattern!');
    if (!isValid) me.reportValidity();
    return isValid;
  }

  checkValidity() {
    return this.#host.checkValidity();
  }

  setCustomValidity(val) {
    return this.#host.setCustomValidity(val);
  }

  reportValidity() {
    return this.#host.reportValidity();
  }

  setSelectionRange(i, j) {
    this.#host.setSelectionRange(i, j);
  }
  
  select() {
    this.#host.select();
  }

  get value() {
    const [i, j] = this.#range();
    return this.raw.substring(0, j);
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

  get pattern() {
    return this.#host.mask;
  }

  get dataset() {
    return this.#host.dataset;
  }

  get selectionStart() {
    return this.#host.selectionStart;
  }

  get selectionEnd() {
    return this.#host.selectionEnd;
  }

  get autoselect() {
    return this.#host.autoselect;
  }

  #onKeyDown(e) {
    this.#back = e.key === "Backspace";
  }

  #onFocus(e) {
    const me = this;
    me.#format(e);
    if (me.autoselect) me.select();
  }

  #onBlur(e) {
    // me.value === me.pattern && (me.value = "");
    this.validate();
  }

  /**
   * If data-slots not defined, try to detect automatically
   * @returns 
   */
  #builSlots() {
    const me = this;
    let slots = me.dataset.slots;
    if (!slots) {
      const maskType = MaskController.#maskType;
      slots = [...new Set(me.pattern)]
        .filter(v => maskType[v.toLowerCase()])
        .join('');
    }
    return new Set(slots || "_");
  }

  /**
   * If data-accept not defined, try to detect automatically
   * @returns 
   */
  #builAccept() {
    const me = this;
    let accept = me.dataset.accept;
    if (!accept) {
      const maskType = MaskController.#maskType;
      accept = [...new Set(me.pattern)]
      .map(v => maskType[v.toLowerCase()])
      .filter(v => v);
      if (accept.length > 0) {
        const tmp = {};
        accept.forEach(v => tmp[v.src] = v);
        accept = Object.values(tmp);
        return accept.length === 1 ? accept.pop() : accept;
      } 

    }
    return new RegExp(accept || "\\d", "g");
  }

  #range() {
    const me = this;
    const value = me.raw;
    return [me.selectionStart, me.selectionEnd].map(i => {
      i = me.#clean(value.slice(0, i)).findIndex(c => me.#slots.has(c));
      return i < 0 ? me.#prev[me.#prev.length - 1] : me.#back ? me.#prev[i - 1] || me.#first : i;
    });
  }

  #format(e) {
    const me = this;
    const [i, j] = me.#range();
    me.value = me.#clean(me.#host.raw).join``;
    me.setSelectionRange(i, j);
    me.#back = false;
  }

  //  TODO support multi #accecpt
  #clean(input) {
    const me = this;
    input = input.match(me.#accept) || [];
    return Array.from(me.pattern, c => input[0] === c || me.#slots.has(c) ? input.shift() || c : c);
  }

  #toPattern() {

    const me = this;

    if (me.pattern.length === 0) return;

    const chars = me.pattern.split('');
    const masks = ['^'];

    const maskType = MaskController.#maskType;
    const special = MaskController.#special;

    let cnt = 0;
    chars.forEach((v, i) => {
      const m = maskType[v.toLowerCase()];
      if (!m) {
        if (cnt > 0) masks.push(`{${++cnt}}`);
        cnt = 0;
        if (special.includes(v)) masks.push('\\');
        return masks.push(v);
      }

      chars[i] = new RegExp(m, 'g');

      if (masks.length === 0) return masks.push(m.source);

      if (masks[masks.length - 1] === m.source) return cnt++;

      if (cnt > 0) masks.push(`{${++cnt}}`);
      cnt = 0;
      masks.push(m.source);
    });

    if (cnt > 0) masks.push(`{${++cnt}}`);
    masks.push('$');

    me.#pattern = new RegExp(masks.join(''), 'g');
    // me.#max = me.pattern.length;
    // me.#masks = chars;
  }

}  