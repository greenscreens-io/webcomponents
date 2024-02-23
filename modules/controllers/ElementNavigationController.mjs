/*
 * Copyright (C) 2015, 2024 Green Screens Ltd.
 */

/**
 * Controller for child element navigation / selection / focusing
 */
export class ElementNavigationController {

  #host;
  #attached;
  #selected;
  #focused;
  #multiselect = new Set();

  constructor(host) {
    const me = this;
    me.#host = host;
    host.addController(me);
  }

  hostConnected() {
    const me = this;
    me.init();
  }

  hostDisconnected() {
    const me = this;
    me.#host.removeController(me);
    me.#host = null;
    me.#attached = false;
  }

  get circular() {
    return this.#host?.circular === true;
  }

  get multiple() {
    return this.#host?.multiple === true;
  }

  get focused() {
    return this.#focused;
  }

  get selected() {
    return this.multiple ? [...this.#multiselect.values()] : this.#selected;
  }

  init() {
    const me = this;
    me.#selected = me.#host.data?.filter(o => o.active).pop();
  }

  attach(el) {
    const me = this;
    if (me.#attached) return;
    me.#attached = true;
    me.#host.attachEvent(el, 'keydown', e => me.onKeyDown(e));
    me.#host.attachEvent(el, 'keyup', e => me.onKeyUp(e));
    me.#host.attachEvent(el, 'click', e => me.onClick(e));
    me.#host.attachEvent(el, 'focusin', e => me.onFocusIn(e));
    me.#host.attachEvent(el, 'focusout', e => me.onFocusOut(e));
  }

  previous() {
    const me = this;
    let el = me.#focused?.previousElementSibling;
    while (el && el.disabled) el = el.previousElementSibling;
    if (me.circular && !el) el = me.lastElementChild;
    el?.focus();
  }

  next() {
    const me = this;
    let el = me.#focused?.nextElementSibling;
    while (el && el.disabled) el = el.nextElementSibling;
    if (me.circular && !el) el = me.firstElementChild;
    el?.focus();
  }

  /**
   * Reset focus / selection
   */
  reset() {
    const me = this;
    if (me.multiple) {
      me.#multiselect.forEach(el => {
        el.active = false;
        el.blur();
      });
    } else if (me.#selected) {
      me.#selected.active = false;
      me.#selected.blur();
    }
    me.#multiselect.clear();
    me.#focused = undefined;
    me.#selected = undefined;
    this.#host?.emit('group-reset', undefined, true);
  }

  /**
   * Callback when child element selected
   * @param {*} el 
   */
  #onSelected(el) {
    this.#host?.onSelected?.(el);
    this.#host?.emit('group-selected', el, true);
  }

  /**
   * Callback when child element deselected
   * @param {*} el 
   */
  #onDeselected(el) {
    this.#host?.onDeselected?.(el);
    this.#host?.emit('group-deselected', el, true);
  }

  /**
   * Callback when child element focused
   * @param {*} el 
   */
  #onFocused(el) {
    this.#host?.onFocused?.(el);
    this.#host?.emit('group-focused', el, true);
  }

  /**
   * Element navigation filter where we can select if focused element is navigable
   * @param {*} el 
   * @returns 
   */
  #isNavigable(el) {
    return this.#host?.isNavigable ? this.#host?.isNavigable(el) : true;
  }

  #focus(el) {
    const me = this;
    if (!me.#isNavigable(el)) return;
    me.#focused = el;
    if (el) {
      me.#onFocused(me.#focused);
    }
  }

  #toggle(el) {
    if (!el) return;
    const me = this;
    if (!me.#isNavigable(el)) return;
    if (el.active) {
      me.#multiselect.add(el);
      me.#onSelected(el);
    } else {
      me.#multiselect.delete(el);
      me.#onDeselected(el);
    }
  }

  #select(el) {
    const me = this;
    if (!me.#isNavigable(el)) return;

    if (me.#selected && !me.multiple) {
      me.#selected.active = false;
      me.#toggle(me.#selected);
    }

    me.#selected = el;
    if (el) {
      if (me.multiple) {
        el.active = !el.active;
      } else {
        el.active = true;
      }
      me.#toggle(el);
    }
  }

  onFocusOut(e) {
    const me = this;
    //if (me.#focused === e.target) me.#focused = undefined;
  }

  onFocusIn(e) {
    const me = this;
    me.#focus(e.target)
  }

  onClick(e) {
    const me = this;
    if (e.ctrlKey) me.reset();
    me.#onDeselected(me.#selected);
    me.#select(e.target);
  }

  onKeyDown(e) {
    const me = this;
    switch (e.code) {
      case 'ArrowUp':
      case 'ArrowLeft':
        me.previous();
        break;
      case 'ArrowDown':
      case 'ArrowRight':
        me.next();
        break;
    }

  }

  onKeyUp(e) {
    const me = this;
    switch (e.code) {
      case 'Space':
      case 'Enter':
        me.#focused?.click();
        break;
    }
  }

}  