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
import GSEvent from "../base/GSEvent.mjs";
import GSUtil from "../base/GSUtil.mjs";

/**
 * Bootstrap modal dialog support
 * @class
 * @extends {GSElement}
 */
export default class GSOffcanvas extends GSElement {

  static {
    customElements.define('gs-offcanvas', GSOffcanvas);
    Object.seal(GSOffcanvas);
  }

  static get observedAttributes() {
    const attrs = ['title', 'visible', 'backdrop', 'placement', 'css', 'closable'];
    return GSElement.observeAttributes(attrs);
  }

  constructor() {
    super();
    this.css = this.css || 'border shadow-sm';
  }

  attributeCallback(name = '', oldValue = '', newValue = '') {
    const me = this;
    me.#update(name, oldValue, newValue);
    if (name === 'visible') GSEvent.send(me, 'action', { type: 'offcanvas', ok: newValue });
  }

  async getTemplate(val = '') {
    return val ? super.getTemplate(val) : this.#html();
  }

  onReady() {
    const me = this;
    super.onReady();
    me.attachEvent(me.#backdropEl, 'click', me.close.bind(me));
    if (me.autoclose) {
      me.attachEvent(me.#canvasEl, 'mouseleave', me.close.bind(me));
      if (me.min > 0) me.attachEvent(me.#canvasEl, 'mouseenter', me.open.bind(me));
    }
    me.#update(null, true, false);
  }

  #update(name = '', oldValue = '', newValue = '') {

    if (oldValue === newValue) return;
    const me = this;

    if (me.#titleEl) GSDOM.setHTML(me.#titleEl, me.title);

    GSDOM.toggleClass(me.#canvasEl, 'visible', true);
    GSDOM.toggleClass(me.#closeEl, 'invisible', !me.closable);
    GSDOM.toggleClass(me.#backdropEl, 'show', me.backdrop && me.visible);

    me.#updateAnim();
    me.#updateShow();
    me.#updateBackdrop();
    me.#updatePlacement(name, oldValue, newValue);
    me.#updateCSS(name, oldValue, newValue);

  }

  #updateAnim() {

    const me = this;
    if (!me.autoclose) return;

    const open = me.visible;
    const pos = me.isHorizontal ? 'width' : 'height';
    const val = open ? me.max : me.min;

    me.#canvasEl.style.transitionProperty = pos;
    me.#canvasEl.style.transitionDuration = `${me.transitionDuration}s`;
    me.#canvasEl.style.transitionTimingFunction = me.transitionFunction;
    me.#canvasEl.style[pos] = `${val}px`;
  }

  #updateShow() {
    const me = this;
    if (me.min === 0 && me.visible) return GSDOM.toggleClass(me.#canvasEl, 'show', me.visible);
    setTimeout(() => {
      GSDOM.toggleClass(me.#canvasEl, me.min === 0 ? me.visible : 'show', true);
    }, GSDOM.SPEED);
  }

  #updateBackdrop() {
    const me = this;
    setTimeout(() => {
      GSDOM.toggleClass(me.#backdropEl, 'invisible', !(me.backdrop && me.visible));
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

  get isVertical() {
    return !this.isHorizontal;
  }

  get isHorizontal() {
    return this.placement === 'start' || this.placement === 'end';
  }

  open() {
    this.visible = true;
  }

  close() {
    this.visible = false;
  }

  toggle() {
    this.visible = !this.visible;
  }

  get css() {
    return GSAttr.get(this, 'css', '');
  }

  get cssTitle() {
    return GSAttr.get(this, 'css-title', 'fs-5');
  }

  get cssHead() {
    return GSAttr.get(this, 'css-head', '');
  }

  get cssBody() {
    return GSAttr.get(this, 'css-body', '');
  }

  set css(val = '') {
    GSAttr.set(this, 'css', val);
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

  get visible() {
    return GSAttr.getAsBool(this, 'visible', false);
  }

  set visible(val = false) {
    GSAttr.setAsBool(this, 'visible', val);
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
    return GSAttr.getAsBool(me, 'backdrop',  me.target?.dataset?.bsBackdrop || 'false');
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
    return GSAttr.getAsNum(this, 'max', 0);
  }

  set max(val = false) {
    GSAttr.set(this, 'max', GSUtil.asNum(val));
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
      <div class="offcanvas offcanvas-${me.placement} overflow-hidden ${me.css}" data-bs-scroll="${me.scroll}" data-bs-backdrop="${me.backdrop}" tabindex="-1">      
      ${header}
      <div class="offcanvas-body  ${me.cssBody}">
        <slot name="body"></slot>
      </div>
    </div>
    <div class="offcanvas-backdrop fade ${me.backdrop && me.visible ? 'show' : 'invisible'}"></div>
    `
  }
}


