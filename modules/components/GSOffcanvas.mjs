/*
 * © Green Screens Ltd., 2016. - 2022.
 */

/**
 * A module loading GSOffcanvas class
 * @module components/GSOffcanvas
 */

import GSElement from "../base/GSElement.mjs";
import GSUtil from "../base/GSUtil.mjs";

/**
 * Bootstrap modal dialog support
 * @class
 * @extends {GSElement}
 */
export default class GSOffcanvas extends GSElement {

  static {
    customElements.define('gs-offcanvas', GSOffcanvas);
  }

  static get observedAttributes() {
    const attrs = ['title', 'visible', 'backdrop', 'placement', 'css', 'closable'];
    return GSUtil.mergeArrays(attrs, super.observedAttributes);
  }

  constructor() {
    super();
    this.css = this.css || 'border shadow-sm';
  }

  attributeCallback(name = '', oldValue = '', newValue = '') {
    const me = this;
    me.#update(name, oldValue, newValue);
    if (name === 'visible') GSUtil.sendEvent(me, 'action', { type: 'offcanvas', ok: newValue });
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

    if (me.#titleEl) me.#titleEl.innerHTML = me.title;

    GSUtil.toggleClass(me.#canvasEl, true, 'visible');
    GSUtil.toggleClass(me.#closeEl, !me.closable, 'invisible');
    GSUtil.toggleClass(me.#backdropEl, me.backdrop && me.visible, 'show');

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
    if (me.min === 0 && me.visible) return GSUtil.toggleClass(me.#canvasEl, me.visible, 'show');
    setTimeout(() => {
      GSUtil.toggleClass(me.#canvasEl, me.min === 0 ? me.visible : true, 'show');
    }, GSUtil.SPEED);
  }

  #updateBackdrop() {
    const me = this;
    setTimeout(() => {
      GSUtil.toggleClass(me.#backdropEl, !(me.backdrop && me.visible), 'invisible');
    }, GSUtil.SPEED);
  }

  #updatePlacement(name = '', oldValue = '', newValue = '') {
    if (name !== 'placement') return;
    const me = this;
    GSUtil.toggleClass(me.#canvasEl, false, `offcanvas-${oldValue}`);
    GSUtil.toggleClass(me.#canvasEl, true, `offcanvas-${newValue}`);
  }

  #updateCSS(name = '', oldValue = '', newValue = '') {
    if (name !== 'css') return;
    const me = this;
    GSUtil.toggleClass(me.#canvasEl, false, oldValue);
    GSUtil.toggleClass(me.#canvasEl, true, newValue);
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
    return GSUtil.getAttribute(this, 'css', '');
  }

  get cssHead() {
    return GSUtil.getAttribute(this, 'css-head', '');
  }

  get cssBody() {
    return GSUtil.getAttribute(this, 'css-body', '');
  }

  set css(val = '') {
    GSUtil.setAttribute(this, 'css', val);
  }

  get transitionDuration() {
    return GSUtil.getAttributeAsNum(this, 'duration', '0.2');
  }

  set transitionDuration(val = '') {
    GSUtil.setAttribute(this, 'duration', val);
  }

  get transitionFunction() {
    return GSUtil.getAttribute(this, 'transition', 'linear');
  }

  set transitionFunction(val = '') {
    GSUtil.setAttribute(this, 'transition', val);
  }

  get title() {
    return GSUtil.getAttribute(this, 'title');
  }

  set title(val = '') {
    GSUtil.setAttribute(this, 'title', val);
  }

  get visible() {
    return GSUtil.getAttributeAsBool(this, 'visible', false);
  }

  set visible(val = false) {
    GSUtil.setAttribute(this, 'visible', val == true);
  }

  get autoclose() {
    return GSUtil.getAttributeAsBool(this, 'autoclose', false);
  }

  set autoclose(val = false) {
    GSUtil.setAttribute(this, 'autoclose', val == true);
  }

  get closable() {
    return GSUtil.getAttributeAsBool(this, 'closable', true);
  }

  set closable(val = true) {
    GSUtil.setAttribute(this, 'closable', val == true);
    this.#update();
  }

  get placement() {
    const me = this;
    return GSUtil.getAttribute(me, 'placement') || GSUtil.getAttribute(me.target, 'data-bs-placement', 'start');
  }

  set placement(val = '') {
    return GSUtil.setAttribute(this, 'placement', val);
  }

  get backdrop() {
    const me = this;
    return GSUtil.getAttributeAsBool(me, 'backdrop', GSUtil.getAttributeAsBool(me.target, 'data-bs-backdrop', 'false'));
  }

  set backdrop(val = '') {
    return GSUtil.setAttribute(this, 'backdrop', val);
  }

  get scroll() {
    const me = this;
    return GSUtil.getAttributeAsBool(me, 'scroll', GSUtil.getAttributeAsBool(me.target, 'data-bs-scroll', 'false'));
  }

  set scroll(val = '') {
    return GSUtil.setAttribute(this, 'scroll', val);
  }

  get min() {
    return GSUtil.getAttributeAsNum(this, 'min', 0);
  }

  set min(val = false) {
    GSUtil.setAttribute(this, 'min', GSUtil.asNum(val));
  }

  get max() {
    return GSUtil.getAttributeAsNum(this, 'max', 0);
  }

  set max(val = false) {
    GSUtil.setAttribute(this, 'max', GSUtil.asNum(val));
  }

  get #canvasEl() {
    return this.findEl('.offcanvas');
  }

  get #titleEl() {
    return this.findEl('.offcanvas-title');
  }

  get #backdropEl() {
    return this.findEl('.offcanvas-backdrop');
  }

  get #closeEl() {
    return this.findEl('.btn-close[data-bs-dismiss="offcanvas"]');
  }

  #html() {
    const me = this;
    const title = me.title ? `<h5 class="offcanvas-title">${me.title}</h5>` : '';
    const closeBtn = me.closable ? `<button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas"></button>` : '';
    const header = title || closeBtn ? `<div class="offcanvas-header ${me.cssHead}"><slot name="header">${title}${closeBtn}</slot></div>` : '';
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

