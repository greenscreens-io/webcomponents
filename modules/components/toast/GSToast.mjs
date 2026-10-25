/*
 * Copyright (C) 2015, 2022 Green Screens Ltd.
 */

/**
 * A module loading GSToast class
 * @module components/toast/GSToast
 */


import GSAttr from "../../base/GSAttr.mjs";
import GSDOM from "../../base/GSDOM.mjs";
import GSElement from "../../base/GSElement.mjs";
import GSUtil from "../../base/GSUtil.mjs";

/**
 * Toast popup with self destroy timeout 
 * @class
 * @extends {GSElement}
 */
export default class GSToast extends GSElement {

  #frameId = null;
  #openTimer = null;
  #dismissTimer = null;

  static {
    customElements.define('gs-toast', GSToast);
    Object.seal(GSToast);
  }

  static get observedAttributes() {
    const attrs = ['placement', 'css'];
    return GSElement.observeAttributes(attrs);
  }

  attributeCallback(name = '', oldValue = '', newValue = '') {
    const me = this;
    if (name === 'css') {
      const el = me.query('.toast');
      GSDOM.toggleClass(el, oldValue, false);
      GSDOM.toggleClass(el, newValue, true);
    }

  }

  async getTemplate(val = '') {
    return `
        <div class="mt-1 mb-1 toast fade">
          <div class="toast-header">
            <strong class="me-auto toast-title"></strong>
            <button type="button" class="btn-close"></button>
          </div>
          <div class="toast-body"></div>
        </div>
    `;
  }

  async onBeforeReady() {
    await super.onBeforeReady();
    const me = this;
    me.#syncContent();
    me.attachEvent(me.query('button'), 'click', me.close.bind(me));
    if (me.visible) me.open();
  }

  #syncContent() {
    const me = this;
    const toast = me.#toast;
    if (!toast) return;
    const titleEl = toast.querySelector('.toast-title');
    const messageEl = toast.querySelector('.toast-body');
    const header = toast.querySelector('.toast-header');
    const button = toast.querySelector('button');
    if (!titleEl || !messageEl || !header || !button) return;
    const title = me.title;
    titleEl.textContent = title;
    messageEl.textContent = me.message;
    header.hidden = !title && !me.closable;
    button.hidden = !me.closable;
    GSDOM.toggleClass(toast, me.css, true);
  }

  display(title = '', message = '', css = '', visible = true, closable = false, timeout = 2, delay = 0) {
    const me = this;
    me.css = css || me.css;
    me.title = title;
    me.message = message;
    me.timeout = timeout;
    me.delay = delay;
    me.closable = GSUtil.asBool(closable);
    me.visible = GSUtil.asBool(visible);
    me.open();
  }
  
  open() {
    const me = this;
    me.#syncContent();
    me.#cancelPending();
    me.#frameId = requestAnimationFrame(() => {
      me.#frameId = null;
      const show = () => {
        me.#openTimer = null;
        GSDOM.toggleClass(me.#toast, 'show', true);
        if (me.timeout > 0) {
          me.#openTimer = setTimeout(() => me.close(), me.timeout * 1000);
        }
      };
      if (me.delay > 0) {
         me.#openTimer = setTimeout(show, me.delay * 1000);
      } else {
        show();
      }
    });
  }

  close() {
    this.#dismiss();
  }

  dismiss() {
    this.#dismiss();
  }

  #dismiss() {
    if (this.#dismissTimer !== null) return;
    if (this.#frameId !== null) cancelAnimationFrame(this.#frameId);
    if (this.#openTimer !== null) clearTimeout(this.#openTimer);
    this.#frameId = null;
    this.#openTimer = null;
    GSDOM.toggleClass(this.#toast, 'show', false);
    this.#dismissTimer = setTimeout(() => {
      this.#dismissTimer = null;
      this.dispatchEvent(new Event('dismissed'));
      this.remove();
    }, GSDOM.SPEED);
  }

  #cancelPending() {
    if (this.#frameId !== null) cancelAnimationFrame(this.#frameId);
    if (this.#openTimer !== null) clearTimeout(this.#openTimer);
    if (this.#dismissTimer !== null) clearTimeout(this.#dismissTimer);
    this.#frameId = null;
    this.#openTimer = null;
    this.#dismissTimer = null;
  }

  disconnectedCallback() {
    this.#cancelPending();
    this.dispatchEvent(new Event('dismissed'));
    super.disconnectedCallback();
  }

  get #toast() {
    return this.query('.toast');
  }

  /**
   * Prevent shadow dom
   */
  get isFlat() {
    return true;
  }

  get title() {
    return GSAttr.get(this, 'title');
  }

  set title(val = '') {
    GSAttr.set(this, 'title', val);
  }

  get message() {
    return GSAttr.get(this, 'message');
  }

  set message(val = '') {
    GSAttr.set(this, 'message', val);
  }

  get css() {
    return GSAttr.get(this, 'css');
  }

  set css(val = '') {
    GSAttr.set(this, 'css', val);
  }

  get timeout() {
    return GSAttr.getAsNum(this, 'timeout', 2);
  }

  set timeout(val = 2) {
    GSAttr.setAsNum(this, 'timeout', val);
  }

  get delay() {
    return GSAttr.getAsNum(this, 'delay', 0);
  }

  set delay(val = 0) {
    GSAttr.setAsNum(this, 'delay', val);
  }

  get closable() {
    return this.hasAttribute('closable');
  }

  set closable(val = true) {
    GSAttr.toggle(this, 'closable', GSUtil.asBool(val));
  }

  get visible() {
    return this.hasAttribute('visible');
  }

  set visible(val = true) {
    GSAttr.toggle(this, 'visible', GSUtil.asBool(val));
  }

}
