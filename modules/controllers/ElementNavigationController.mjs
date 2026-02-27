/*
 * Copyright (C) 2015, 2026; Green Screens Ltd.
 */

import { GROUP, DEF } from "../base/GSConst.mjs";
import { GSEvents } from "../base/GSEvents.mjs";
import { GSElement } from "../GSElement.mjs";

/**
 * Controller for child element navigation / selection / focusing
 * Used for button, navs, tabs and element groups
 */
export class ElementNavigationController {

  #host;
  #focused;
  #hostUpdated = false;
  #tagName = undefined;

  #onClickListener = undefined;
  #onKeyUpListener = undefined;
  #onKeyDownListener = undefined;
  #onFocusInListener = undefined;
  #onFocusOutListener = undefined;

  constructor(host) {
    const me = this;
    me.#host = host;
    me.#tagName = me.#childTagName;
    me.#onClickListener = me.onClick.bind(me);
    me.#onKeyUpListener = me.onKeyUp.bind(me);
    me.#onKeyDownListener = me.onKeyDown.bind(me);
    me.#onFocusInListener = me.onFocusIn.bind(me);
    me.#onFocusOutListener = me.onFocusOut.bind(me);

    host.addController(me);
  }

  hostConnected() {
    const me = this;
  }

  hostDisconnected() {
    const me = this;
    const target = me.#target;
    if (target) {
      me.#host.removeEvent(target, 'keydown', me.#onKeyDownListener);
      me.#host.removeEvent(target, 'keyup', me.#onKeyUpListener);
      me.#host.removeEvent(target, 'click', me.#onClickListener);
      me.#host.removeEvent(target, 'focusin', me.#onFocusInListener);
      me.#host.removeEvent(target, 'focusout', me.#onFocusOutListener);
    }    
    me.#host.removeController(me);
    me.#host = null;
  }

  hostUpdated() {
    const me = this;
    if (!me.#hostUpdated) {
      me.#hostUpdated = true;
      me.firstUpdate();
    }
  }

  /**
   * Called on first update from host component
   */
  firstUpdate() {
    const me = this;
    me.#tagName = me.first?.tagName || '';
    const target = me.#target;
    if (target) {
      me.#host.attachEvent(target, 'keydown', me.#onKeyDownListener);
      me.#host.attachEvent(target, 'keyup', me.#onKeyUpListener);
      me.#host.attachEvent(target, 'click', me.#onClickListener);
      me.#host.attachEvent(target, 'focusin', me.#onFocusInListener);
      me.#host.attachEvent(target, 'focusout', me.#onFocusOutListener);
    }
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
    const me = this;
    const list = me.items.filter(el => el.active);
    return me.multiple ? list : list.pop();
  }

  get items() {
    const me = this;    
    return Array.from(me.#host.children)
    .filter(el => el.tagName !== 'GS-ITEM')
    .filter(el => me.#tagName ? el.tagName === me.#tagName : true);
  }

  get first() {
    return this.items.shift();
  }

  get last() {
    return this.items.pop();
  }

  /**
   * Element that listens for events
   */
  get #target() {
    return this.#host[DEF] || this.#host.shadowRoot.firstElementChild;
  }

  /**
   * As default use data-gs-child-tag-name
   */
  get #childTagName() {
    const me = this;
    return (me.#host.dataset.gsChildTagName || me.#host[GROUP] || '').toUpperCase();
  }

  previous() {
    const me = this;
    let el = me.#focused?.previousElementSibling;
    while (el?.disabled) el = el.previousElementSibling;
    if (me.circular && !el) el = me.last;
    el?.focus();
  }

  next() {
    const me = this;
    let el = me.#focused?.nextElementSibling;
    while (el?.disabled) el = el.nextElementSibling;
    if (me.circular && !el) el = me.first;
    el?.focus();
  }

  /**
   * Reset focus / selection
   */
  reset() {
    const me = this;
    const active = me.selected;
    if (me.multiple) {
      active.forEach(el => {
        el.active = false;
        el.blur();
      });
    } else if (active) {
      active.active = false;
      active.blur();
    }
    me.#focused = undefined;
    me.#host?.onReset?.(el);
    me.#host?.emit('group-reset', undefined, true);
  }

  /**
   * Callback when child element selected
   * @param {*} el 
   */
  #onSelected(el) {
    const me = this;
    me.#host?.onSelected?.(el);
    me.#host?.emit('group-selected', el, true);
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
    return el?.tagName === this.#tagName || el?.isNav || false;
  }


  #focus(el) {
    const me = this;
    me.#focused = el;
    if (el) {
      me.#onFocused(me.#focused);
    }
  }

  #toggle(el) {
    const me = this;
    if (el.active) {
      me.#onSelected(el);
    } else {
      me.#onDeselected(el);
    }
  }

  #select(el) {
    const me = this;
    const active = me.selected;
    if (active && !me.multiple) {
      active.active = false;
      me.#toggle(active);
    }

    if (me.multiple) {
      el.active = !el.active;
    } else {
      el.active = true;
    }
    me.#toggle(el);
  }

  onFocusOut(e) {
    const me = this;
    //if (me.#focused === e.target) me.#focused = undefined;
  }

  onFocusIn(e) {
    const me = this;
    if(me.#isNavigable(e.target)) {
      if(me.#isNavigable(e.relatedTarget)) {
        me.#focus(e.target)
      } else if (me.multiple) {
        me.selected?.pop?.()?.focus?.();
      } else {
        me.selected?.focus();
      }
    }
  }

  onClick(e) {
    const me = this;
    const el = e.composedPath()
    .filter(el => el instanceof GSElement)
    .filter(el => el.parentComponent === me.#host).pop();
    if(me.#isNavigable(e.target)) {
      if (e.ctrlKey) me.reset();
      me.#onDeselected(me.selected);
      me.#select(el);
    }
  }

  onKeyDown(e) {    
    const me = this;
    if(me.#isNavigable(e.target)) {
      switch (e.code) {
        case 'ArrowUp':
        case 'ArrowLeft':
          me.previous();
          break;
        case 'ArrowDown':
        case 'ArrowRight':
          me.next();
          break;
        case 'Space':
        case 'Enter':
          GSEvents.prevent(e);
          break;        
      }
    }
  }

  onKeyUp(e) {
    const me = this;
    if(me.#isNavigable(e.target)) {
      switch (e.code) {
        case 'Space':
        case 'Enter':
          //me.#focused?.click();
          e.target.click();
          break;
      }
    }
  }

}  