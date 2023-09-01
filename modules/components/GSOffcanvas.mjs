/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSOffcanvas class
 * @module components/GSOffcanvas
 */

import GSAttr from "../base/GSAttr.mjs";
import GSDOM from "../base/GSDOM.mjs";
import GSElement from "../base/GSElement.mjs";
import GSEvents from "../base/GSEvents.mjs";
import GSGesture from "../base/GSGesture.mjs";
import GSUtil from "../base/GSUtil.mjs";
import GSCacheStyles from "../head/GSCacheStyles.mjs";

/**
 * Bootstrap modal dialog support
 * @class
 * @extends {GSElement}
 */
export default class GSOffcanvas extends GSElement {

  #swiper = null;
  #bindings = null;

  static {
    customElements.define('gs-offcanvas', GSOffcanvas);
    Object.seal(GSOffcanvas);
  }

  static get observedAttributes() {
    const attrs = ['title', 'expanded', 'backdrop', 'placement', 'css', 'closable'];
    return GSElement.observeAttributes(attrs);
  }

  constructor() {
    super();
    const me = this;
    me.css = me.css || 'border shadow-sm';
    me.#bindings = {
      left: me.onSwipeLeft.bind(me),
      right: me.onSwipeRight.bind(me),
      up: me.onSwipeUp.bind(me),
      down: me.onSwipeDown.bind(me)
    };
  }

  connectedCallback() {
    const me = this;
    me.#bindEvents();
    me.#swiper = null;
    me.#bindings = null;
    super.connectedCallback();
  }

  disconnectedCallback() {
    this.#unbindEvents();
    super.disconnectedCallback();
  }

  attributeCallback(name = '', oldValue = '', newValue = '') {
    const me = this;
    me.#update(name, oldValue, newValue);
    if (name === 'expanded') me.emit('action', { type: 'offcanvas', ok: GSUtil.asBool(newValue) });
  }

  async getTemplate(val = '') {
    return val ? super.getTemplate(val) : this.#html();
  }

  async onBeforeReady() {
    await super.onBeforeReady();
    const me = this;
    me.attachEvent(me.#backdropEl, 'click', me.close.bind(me));
    me.attachEvent(me.#canvasEl, 'mouseleave', me.#onLeave.bind(me));
    me.attachEvent(me.#canvasEl, 'mouseenter', me.#onEnter.bind(me));
    me.#update(null, true, false);
  }

  #onLeave() {
    const me = this;
    if (me.autoclose) me.close();
  }

  #onEnter() {
    const me = this;
    if (me.min > 0) me.open();
  }

  #update(name = '', oldValue = '', newValue = '') {

    if (oldValue === newValue) return;
    const me = this;

    if (me.#titleEl) GSDOM.setHTML(me.#titleEl, me.title);

    GSDOM.toggleClass(me.#canvasEl, 'visible', true);
    GSDOM.toggleClass(me.#closeEl, 'invisible', !me.closable);
    GSDOM.toggleClass(me.#backdropEl, 'show', me.backdrop && me.expanded);

    me.#updateAnim();
    me.#updateShow();
    me.#updateBackdrop();
    me.#updatePlacement(name, oldValue, newValue);
    me.#updateCSS(name, oldValue, newValue);

  }

  #updateAnim() {

    const me = this;
    const open = me.expanded;

    const pos = me.isHorizontal ? 'width' : 'height';
    const val = open ? me.max : me.min;

    /*
    me.#canvasEl.style.transitionProperty = pos;
    me.#canvasEl.style.transitionDuration = `${me.transitionDuration}s`;
    me.#canvasEl.style.transitionTimingFunction = me.transitionFunction;
    me.#canvasEl.style[pos] = `${val}px`;
    */

    const obj = {
      'transition-property': `${pos} !important`,
      'transition-duration': `${me.transitionDuration}s  !important`,
      'transition-timing-function': `${me.transitionFunction} !important`
    };
    if (GSUtil.isNumber(val)) {
      obj[pos] = `${val}px !important`;
    } else {
      obj[pos] = `${val} !important`;
    }
    GSCacheStyles.setRule(me.styleID, obj);

  }

  #updateShow() {
    const me = this;
    if (me.min === 0 && me.expanded) return GSDOM.toggleClass(me.#canvasEl, 'show', me.expanded);
    setTimeout(() => {
      GSDOM.toggleClass(me.#canvasEl, me.min === 0 ? me.expanded : 'show', true);
    }, GSDOM.SPEED);
  }

  #updateBackdrop() {
    const me = this;
    setTimeout(() => {
      GSDOM.toggleClass(me.#backdropEl, 'invisible', !(me.backdrop && me.expanded));
    }, GSDOM.SPEED);
  }

  #updatePlacement(name = '', oldValue = '', newValue = '') {
    if (name !== 'placement') return;
    const me = this;
    GSDOM.toggleClass(me.#canvasEl, `offcanvas-${oldValue}`, false);
    GSDOM.toggleClass(me.#canvasEl, `offcanvas-${newValue}`, true);
  }

  #updateCSS(name = '', oldValue = '', newValue = '') {
    if (name !== 'css') return;
    const me = this;
    GSDOM.toggleClass(me.#canvasEl, oldValue, false);
    GSDOM.toggleClass(me.#canvasEl, newValue, true);
  }

  #bindEvents() {
    const me = this;
    me.#swiper = GSGesture.attach(document);
    GSEvents.attach(document, document, 'swipe-left', me.#bindings.left, false);
    GSEvents.attach(document, document, 'swipe-right', me.#bindings.right, false);
    GSEvents.attach(document, document, 'swipe-up', me.#bindings.up, false);
    GSEvents.attach(document, document, 'swipe-down', me.#bindings.down, false);
  }

  #unbindEvents() {
    const me = this;
    me.#swiper?.unbind();
    me.#swiper = null;
    GSEvents.remove(document, document, 'swipe-left', me.#bindings.left);
    GSEvents.remove(document, document, 'swipe-right', me.#bindings.right);
    GSEvents.remove(document, document, 'swipe-up', me.#bindings.up);
    GSEvents.remove(document, document, 'swipe-down', me.#bindings.down);
  }

  onSwipeLeft(e) {
    const me = this;
    if (!me.#isFingersValid(e)) return;
    switch (me.placement) {
      case 'start':
        me.close();
        break;
      case 'end':
        me.open();
        break;
    }
  }

  onSwipeRight(e) {
    const me = this;
    if (!me.#isFingersValid(e)) return;
    switch (me.placement) {
      case 'start':
        me.open();
        break;
        case 'end':
          me.close();
        break;
    }    
  }

  onSwipeUp(e) {
    const me = this;
    if (!me.#isFingersValid(e)) return;
    switch (me.placement) {
      case 'top':
        me.close();
        break;
      case 'bottom':
        me.open();
        break;
    }
  }

  onSwipeDown(e) {
    const me = this;
    if (!me.#isFingersValid(e)) return;
    switch (me.placement) {
      case 'top':
        me.open();
        break;
      case 'bottom':
        me.close();
        break;
    }    
  }

  #isFingersValid(e) {
    const fingers = GSGesture.fingers(e);
    return fingers === this.fingers;
  }

  get isVertical() {
    return !this.isHorizontal;
  }

  get isHorizontal() {
    return this.placement === 'start' || this.placement === 'end';
  }

  open() {
    this.expanded = true;
  }

  close() {
    this.expanded = false;
  }

  toggle() {
    this.expanded = !this.expanded;
  }

  get fingers() {
    return GSAttr.getAsNum(this, 'fingers', 2);
  }

  set fingers(val = 2) {
    GSAttr.setAsNum(this, 'fingers', val);
  }

  get css() {
    return GSAttr.get(this, 'css', '');
  }

  set css(val = '') {
    GSAttr.set(this, 'css', val);
  }

  get cssTitle() {
    return GSAttr.get(this, 'css-title', 'fs-5');
  }

  set cssTitle(val = '') {
    GSAttr.set(this, 'css-title', val);
  }

  get cssHead() {
    return GSAttr.get(this, 'css-head', '');
  }

  set cssHead(val = '') {
    GSAttr.set(this, 'css-head', val);
  }

  get cssBody() {
    return GSAttr.get(this, 'css-body', '');
  }

  set cssBody(val = '') {
    GSAttr.set(this, 'css-body', val);
  }

  get transitionDuration() {
    return GSAttr.getAsNum(this, 'duration', '0.2');
  }

  set transitionDuration(val = '') {
    GSAttr.set(this, 'duration', val);
  }

  get transitionFunction() {
    return GSAttr.get(this, 'transition', 'linear');
  }

  set transitionFunction(val = '') {
    GSAttr.set(this, 'transition', val);
  }

  get title() {
    return GSAttr.get(this, 'title');
  }

  set title(val = '') {
    GSAttr.set(this, 'title', val);
  }

  get expanded() {
    return GSAttr.getAsBool(this, 'expanded', false);
  }

  set expanded(val = false) {
    GSAttr.setAsBool(this, 'expanded', val);
  }

  get autoclose() {
    return GSAttr.getAsBool(this, 'autoclose', false);
  }

  set autoclose(val = false) {
    GSAttr.setAsBool(this, 'autoclose', val);
  }

  get closable() {
    return GSAttr.getAsBool(this, 'closable', true);
  }

  set closable(val = true) {
    GSAttr.setAsBool(this, 'closable', val);
    this.#update();
  }

  get placement() {
    const me = this;
    return GSAttr.get(me, 'placement', me.target?.dataset?.bsPlacement || 'start');
  }

  set placement(val = '') {
    return GSAttr.set(this, 'placement', val);
  }

  get backdrop() {
    const me = this;
    return GSAttr.getAsBool(me, 'backdrop', me.target?.dataset?.bsBackdrop || 'false');
  }

  set backdrop(val = '') {
    return GSAttr.set(this, 'backdrop', val);
  }

  get scroll() {
    const me = this;
    return GSAttr.getAsBool(me, 'scroll', me.target?.dataset?.bsScroll || 'false');
  }

  set scroll(val = '') {
    return GSAttr.set(this, 'scroll', val);
  }

  get min() {
    return GSAttr.getAsNum(this, 'min', 0);
  }

  set min(val = false) {
    GSAttr.set(this, 'min', GSUtil.asNum(val));
  }

  get max() {
    return GSAttr.get(this, 'max', 'auto');
  }

  set max(val = false) {
    GSAttr.set(this, 'max', val);
  }

  get #canvasEl() {
    return this.query('.offcanvas');
  }

  get #titleEl() {
    return this.query('.offcanvas-title');
  }

  get #backdropEl() {
    return this.query('.offcanvas-backdrop');
  }

  get #closeEl() {
    return this.query('.btn-close[data-bs-dismiss="offcanvas"]');
  }

  get #headSlot() {
    return this.querySelector('[slot="header"]');
  }

  #html() {
    const me = this;
    const title = me.title ? `<div class="offcanvas-title ${me.cssTitle}">${me.title}</div>` : '';
    const closeBtn = me.closable ? `<button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas"></button>` : '';
    const header = title || closeBtn || me.#headSlot ? `<div class="offcanvas-header ${me.cssHead}"><slot name="header">${title}${closeBtn}</slot></div>` : '';
    return `
      <div class="offcanvas offcanvas-${me.placement} overflow-hidden ${me.css} ${me.styleID}" data-bs-scroll="${me.scroll}" data-bs-backdrop="${me.backdrop}" tabindex="-1">      
      ${header}
      <div class="offcanvas-body  ${me.cssBody}">
        <slot name="body"></slot>
      </div>
    </div>
    <div class="offcanvas-backdrop fade ${me.backdrop && me.expanded ? 'show' : 'invisible'}"></div>
    `
  }
}
